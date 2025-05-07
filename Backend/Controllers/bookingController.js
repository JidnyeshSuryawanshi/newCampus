const Booking = require('../Models/booking');
const HostelRoom = require('../Models/hostelRoom');
const Mess = require('../Models/mess');
const User = require('../Models/user');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Student)
exports.createBooking = asyncHandler(async (req, res, next) => {
  try {
    // Make sure the user is a student
    if (!req.user.userType.includes('student')) {
      return next(new ErrorResponse('Only students can create bookings', 403));
    }

    const { serviceType, serviceId, bookingDetails } = req.body;

    // Validate service exists and is available
    let serviceModel;
    if (serviceType === 'hostel') {
      serviceModel = HostelRoom;
    } else if (serviceType === 'mess') {
      serviceModel = Mess;
    } else if (serviceType === 'gym') {
      // Add gym model when implemented
      return next(new ErrorResponse('Gym bookings are not implemented yet', 400));
    } else {
      return next(new ErrorResponse('Invalid service type', 400));
    }

    // Check if service exists
    const service = await serviceModel.findById(serviceId);
    if (!service) {
      return next(new ErrorResponse(`No ${serviceType} found with id ${serviceId}`, 404));
    }

    // Check if service is available
    if (!service.availability) {
      return next(new ErrorResponse(`This ${serviceType} is not available for booking`, 400));
    }

    // Get owner ID from the service
    const ownerId = service.owner;

    // Create the booking
    const booking = await Booking.create({
      student: req.user.id,
      owner: ownerId,
      serviceType,
      serviceId,
      bookingDetails
    });

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all bookings for the current user (student or owner)
// @route   GET /api/bookings
// @access  Private
exports.getBookings = asyncHandler(async (req, res, next) => {
  try {
    let query = {};

    // If user is a student, get their bookings
    if (req.user.userType === 'student') {
      query.student = req.user.id;
    } 
    // If user is an owner, get bookings for their services
    else if (req.user.userType.includes('Owner')) {
      query.owner = req.user.id;
    }

    // Add status filter if provided
    if (req.query.status && ['pending', 'accepted', 'rejected', 'cancelled'].includes(req.query.status)) {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'student',
        select: 'username email'
      })
      .populate({
        path: 'owner',
        select: 'username email userType'
      })
      .sort({ createdAt: -1 });

    // Instead of using refPath, manually populate service details
    const populatedBookings = [];
    
    for (const booking of bookings) {
      let bookingObj = booking.toObject();
      
      // Populate service details based on service type
      if (booking.serviceType === 'hostel') {
        try {
          const hostelRoom = await HostelRoom.findById(booking.serviceId);
          if (hostelRoom) {
            bookingObj.serviceDetails = {
              roomName: hostelRoom.roomName,
              price: hostelRoom.price,
              address: hostelRoom.address,
              roomType: hostelRoom.roomType,
              gender: hostelRoom.gender,
              capacity: hostelRoom.capacity,
              images: hostelRoom.images
            };
          }
        } catch (err) {
          console.error(`Error fetching hostel room details: ${err.message}`);
        }
      }
      else if (booking.serviceType === 'mess') {
        try {
          const mess = await Mess.findById(booking.serviceId);
          if (mess) {
            bookingObj.serviceDetails = {
              messName: mess.messName,
              monthlyPrice: mess.monthlyPrice,
              dailyPrice: mess.dailyPrice,
              address: mess.address,
              messType: mess.messType,
              capacity: mess.capacity,
              images: mess.images,
              openingHours: mess.openingHours
            };
          }
        } catch (err) {
          console.error(`Error fetching mess details: ${err.message}`);
        }
      }
      // Add other service types when implemented (gym)
      
      populatedBookings.push(bookingObj);
    }

    res.status(200).json({
      success: true,
      count: populatedBookings.length,
      data: populatedBookings
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get a single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'student',
        select: 'username email'
      })
      .populate({
        path: 'owner',
        select: 'username email userType'
      });

    if (!booking) {
      return next(new ErrorResponse(`No booking found with id ${req.params.id}`, 404));
    }

    // Check booking belongs to current user (either as student or owner)
    if (
      booking.student._id.toString() !== req.user.id &&
      booking.owner._id.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized to access this booking', 403));
    }

    let bookingObj = booking.toObject();
    
    // Populate service details based on service type
    if (booking.serviceType === 'hostel') {
      try {
        const hostelRoom = await HostelRoom.findById(booking.serviceId);
        if (hostelRoom) {
          bookingObj.serviceDetails = {
            roomName: hostelRoom.roomName,
            price: hostelRoom.price,
            address: hostelRoom.address,
            roomType: hostelRoom.roomType,
            gender: hostelRoom.gender,
            capacity: hostelRoom.capacity,
            images: hostelRoom.images
          };
        }
      } catch (err) {
        console.error(`Error fetching hostel room details: ${err.message}`);
      }
    }
    else if (booking.serviceType === 'mess') {
      try {
        const mess = await Mess.findById(booking.serviceId);
        if (mess) {
          bookingObj.serviceDetails = {
            messName: mess.messName,
            monthlyPrice: mess.monthlyPrice,
            dailyPrice: mess.dailyPrice,
            address: mess.address,
            messType: mess.messType,
            capacity: mess.capacity,
            images: mess.images,
            openingHours: mess.openingHours
          };
        }
      } catch (err) {
        console.error(`Error fetching mess details: ${err.message}`);
      }
    }
    // Add other service types when implemented (gym)

    res.status(200).json({
      success: true,
      data: bookingObj
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update booking status (accept/reject) - Owner only
// @route   PUT /api/bookings/:id
// @access  Private (Owner)
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return next(new ErrorResponse('Invalid status. Must be accepted or rejected', 400));
    }

    // Find booking
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorResponse(`No booking found with id ${req.params.id}`, 404));
    }

    // Make sure user is booking owner
    if (booking.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this booking', 403));
    }

    // Update the booking
    booking.status = status;
    booking.updatedAt = Date.now();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel a booking - Student only
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Student)
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  try {
    // Find booking
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorResponse(`No booking found with id ${req.params.id}`, 404));
    }

    // Make sure user is booking student
    if (booking.student.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to cancel this booking', 403));
    }

    // Only pending bookings can be cancelled
    if (booking.status !== 'pending') {
      return next(new ErrorResponse(`Cannot cancel a booking that is ${booking.status}`, 400));
    }

    // Update the booking
    booking.status = 'cancelled';
    booking.updatedAt = Date.now();
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update booking payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private (Student)
exports.updatePaymentStatus = asyncHandler(async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    
    // Validate payment status
    if (!paymentStatus || !['paid', 'unpaid'].includes(paymentStatus)) {
      return next(new ErrorResponse('Invalid payment status. Must be paid or unpaid', 400));
    }
    
    // Find booking
    let booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return next(new ErrorResponse(`No booking found with id ${req.params.id}`, 404));
    }
    
    // Make sure user is booking student
    if (booking.student.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update payment status of this booking', 403));
    }
    
    // Only accepted bookings can have their payment status updated
    if (booking.status !== 'accepted') {
      return next(new ErrorResponse('Only accepted bookings can be paid for', 400));
    }
    
    // Update the booking
    booking.paymentStatus = paymentStatus;
    booking.updatedAt = Date.now();
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
}); 