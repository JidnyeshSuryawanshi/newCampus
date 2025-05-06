const axios = require('axios');

// Replace with your actual token
const token = 'YOUR_JWT_TOKEN';

async function testUserDetailsAPI() {
  try {
    const response = await axios.get('http://localhost:5000/api/student/details', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('API Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('\nAPI call successful!');
      console.log('Account details:', response.data.data.account);
      
      if (response.data.data.profile) {
        console.log('\nProfile exists with the following sections:');
        const profile = response.data.data.profile;
        
        if (profile.personalInfo) console.log('- Personal Info: ✓');
        if (profile.academicInfo) console.log('- Academic Info: ✓');
        if (profile.paymentInfo) console.log('- Payment Info: ✓');
        if (profile.preferences) console.log('- Preferences: ✓');
        if (profile.documents && profile.documents.length > 0) {
          console.log(`- Documents: ✓ (${profile.documents.length} documents)`);
        }
      } else {
        console.log('\nNo profile exists for this user yet.');
      }
    } else {
      console.error('API call failed:', response.data.message);
    }
  } catch (error) {
    console.error('Error testing API:', error.response ? error.response.data : error.message);
  }
}

testUserDetailsAPI();
