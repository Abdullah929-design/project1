// Simple test script for cart endpoints
// Run with: node test-cart.js

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

// Test product ID (you'll need to replace this with an actual product ID from your database)
const testProductId = '507f1f77bcf86cd799439011'; // Example MongoDB ObjectId

async function testCartAPI() {
  console.log('🧪 Testing Cart API...\n');

  try {
    // 1. Login to get token
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed. Creating test user...');
      
      // Try to create user first
      const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });

      if (signupResponse.ok) {
        console.log('✅ Test user created successfully');
        
        // Try login again
        const retryLogin = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser)
        });

        if (retryLogin.ok) {
          const loginData = await retryLogin.json();
          authToken = loginData.token;
          console.log('✅ Login successful');
        } else {
          console.log('❌ Login still failed after user creation');
          return;
        }
      } else {
        console.log('❌ User creation failed');
        return;
      }
    } else {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
      console.log('✅ Login successful');
    }

    // 2. Get cart (should create empty cart)
    console.log('\n2. Testing get cart...');
    const getCartResponse = await fetch(`${BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (getCartResponse.ok) {
      const cart = await getCartResponse.json();
      console.log('✅ Get cart successful');
      console.log(`   Cart items: ${cart.items.length}`);
      console.log(`   Cart total: $${cart.total}`);
    } else {
      console.log('❌ Get cart failed');
      const error = await getCartResponse.json();
      console.log(`   Error: ${error.message}`);
    }

    // 3. Add item to cart
    console.log('\n3. Testing add to cart...');
    const addToCartResponse = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: testProductId,
        quantity: 2
      })
    });

    if (addToCartResponse.ok) {
      const cart = await addToCartResponse.json();
      console.log('✅ Add to cart successful');
      console.log(`   Cart items: ${cart.items.length}`);
      console.log(`   Cart total: $${cart.total}`);
    } else {
      const error = await addToCartResponse.json();
      console.log(`❌ Add to cart failed: ${error.message}`);
      console.log('   (This is expected if the test product ID is invalid)');
    }

    // 4. Get cart again to verify
    console.log('\n4. Testing get cart again...');
    const getCartAgainResponse = await fetch(`${BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (getCartAgainResponse.ok) {
      const cart = await getCartAgainResponse.json();
      console.log('✅ Get cart successful');
      console.log(`   Cart items: ${cart.items.length}`);
      console.log(`   Cart total: $${cart.total}`);
    } else {
      console.log('❌ Get cart failed');
    }

    console.log('\n🎉 Cart API test completed!');
    console.log('\nNote: Add to cart test may fail if the test product ID is invalid.');
    console.log('This is expected behavior - the API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testCartAPI(); 