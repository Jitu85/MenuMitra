/**
 * MenuMitra Automated End-to-End API Integration Test Script
 * Developed by Abhijit Kumar Misra
 * 
 * Verifies all 10+ core routes of the platform backend on port 4000.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000/api';
const randomSuffix = Math.floor(1000 + Math.random() * 9000);
const testEmail = `merchant_${randomSuffix}@menumitra.com`;
const testPhone = `9876${randomSuffix}`;
const testPassword = 'SecurePassword123';

const runTests = async () => {
  console.log('================================================================');
  console.log('      MENUMITRA AUTOMATED API INTEGRATION TEST FLOW              ');
  console.log('================================================================\n');

  let ownerToken = '';
  let ownerId = '';
  let ownerSlug = '';
  let categoryId = '';
  let foodItemId = '';
  let orderId = '';
  let adminToken = '';

  try {
    // 1. Business Owner Registration
    console.log('[1/11] Testing Owner Registration (/api/auth/signup)...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/signup`, {
      business_name: `Tasty Bites Cafe ${randomSuffix}`,
      business_type: 'cafe',
      owner_name: 'Abhijit Kumar Misra',
      email: testEmail,
      phone: testPhone,
      address: '123 Main Street',
      city: 'Guwahati',
      state: 'Assam',
      pincode: '781001',
      table_count: 15,
      password: testPassword
    });

    if (registerResponse.status === 201) {
      console.log('✅ Registration SUCCESS!');
      ownerToken = registerResponse.data.token;
      ownerId = registerResponse.data.owner?.id || registerResponse.data.user?.id;
      ownerSlug = registerResponse.data.owner?.slug || registerResponse.data.user?.slug;
      console.log(`   - Owner ID: ${ownerId}`);
      console.log(`   - Owner Slug: ${ownerSlug}`);
    } else {
      throw new Error(`Registration failed with status ${registerResponse.status}`);
    }

    // 2. Business Owner Login
    console.log('\n[2/11] Testing Owner Login (/api/auth/login)...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    if (loginResponse.status === 200) {
      console.log('✅ Owner Login SUCCESS!');
      ownerToken = loginResponse.data.token;
    } else {
      throw new Error('Owner login failed!');
    }

    const ownerHeaders = { Authorization: `Bearer ${ownerToken}` };

    // 3. Fetch Owner Profile
    console.log('\n[3/11] Testing Owner Profile Fetch (/api/owner/profile)...');
    const profileResponse = await axios.get(`${BASE_URL}/owner/profile`, { headers: ownerHeaders });
    if (profileResponse.status === 200) {
      console.log('✅ Profile fetch SUCCESS!');
      console.log(`   - Verified Owner Name: ${profileResponse.data.owner_name}`);
    }

    // 4. Create Menu Category
    console.log('\n[4/11] Testing Category Creation (/api/menu/categories)...');
    const categoryResponse = await axios.post(`${BASE_URL}/menu/categories`, {
      name_en: 'Special Mocktails',
      name_hi: 'विशेष मॉकटेल',
      sort_order: 1
    }, { headers: ownerHeaders });

    if (categoryResponse.status === 201) {
      console.log('✅ Category creation SUCCESS!');
      categoryId = categoryResponse.data.id || categoryResponse.data.category?.id;
      console.log(`   - Category ID: ${categoryId}`);
    }

    // 5. Add Food Item to Category
    console.log('\n[5/11] Testing Food Item Addition (/api/menu/items)...');
    const itemResponse = await axios.post(`${BASE_URL}/menu/items`, {
      name_en: 'Blue Curacao Lagoon',
      name_hi: 'ब्लू कुराकाओ लैगून',
      description_en: 'Refreshing blue mint lemon mocktail',
      description_hi: 'ताजा करने वाला ब्लू मिंट लेमन मॉकटेल',
      price: 180.00,
      category_id: categoryId,
      is_veg: true,
      sort_order: 1
    }, { headers: ownerHeaders });

    if (itemResponse.status === 201) {
      console.log('✅ Food Item creation SUCCESS!');
      foodItemId = itemResponse.data.id || itemResponse.data.item?.id || itemResponse.data.foodItem?.id;
      console.log(`   - Food Item ID: ${foodItemId}`);
    }

    // 6. Public Customer Menu Access by Slug
    console.log(`\n[6/11] Testing Public Customer Menu Access (/api/public/menu/${ownerSlug})...`);
    const publicMenuResponse = await axios.get(`${BASE_URL}/public/menu/${ownerSlug}`);
    if (publicMenuResponse.status === 200) {
      console.log('✅ Public menu loaded SUCCESS!');
      const categoriesCount = publicMenuResponse.data.categories?.length || 0;
      console.log(`   - Categories count: ${categoriesCount}`);
    }

    // 7. Place Order (Customer cart submission)
    console.log('\n[7/11] Testing Order Placement (/api/orders)...');
    const orderResponse = await axios.post(`${BASE_URL}/orders`, {
      owner_id: ownerId,
      table_number: '05',
      customer_name: 'Jitu Guest',
      notes: 'Less ice please',
      items: [
        {
          food_item_id: foodItemId,
          quantity: 2
        }
      ]
    });

    if (orderResponse.status === 201) {
      console.log('✅ Guest order placed SUCCESS!');
      orderId = orderResponse.data.id || orderResponse.data.order?.id;
      console.log(`   - Order ID: ${orderId}`);
      console.log(`   - Total Amount: ₹${orderResponse.data.totalAmount || orderResponse.data.order?.totalAmount || orderResponse.data.order?.total_amount}`);
    }

    // 8. Customer Payment Verification Simulation (Mock Mode)
    console.log(`\n[8/11] Simulating Customer payment verification (/api/payment/verify)...`);
    const verifyResponse = await axios.post(`${BASE_URL}/payment/verify`, {
      orderId: orderId,
      isMock: true
    });
    if (verifyResponse.status === 200) {
      console.log('✅ Mock payment verification SUCCESS! Order payment status is paid.');
    }

    // 9. Fetch Owner Dashboard Orders
    console.log('\n[9/11] Fetching Owner Orders to verify notification (/api/orders)...');
    const ownerOrdersResponse = await axios.get(`${BASE_URL}/orders`, { headers: ownerHeaders });
    if (ownerOrdersResponse.status === 200) {
      console.log('✅ Owner orders fetched SUCCESS!');
      const orders = ownerOrdersResponse.data.orders || ownerOrdersResponse.data;
      const foundOrder = orders.find(o => o.id === orderId);
      console.log(`   - Order found on Dashboard: ${foundOrder ? 'YES' : 'NO'}`);
      console.log(`   - Payment Status: ${foundOrder ? foundOrder.paymentStatus || foundOrder.payment_status : 'N/A'}`);
    }

    // 10. Owner Mark Order as Paid (Testing status update)
    console.log(`\n[10/11] Testing Owner updating order payment status to paid (/api/orders/${orderId}/status)...`);
    const markPaidResponse = await axios.put(`${BASE_URL}/orders/${orderId}/status`, {
      paymentStatus: 'paid'
    }, { headers: ownerHeaders });
    if (markPaidResponse.status === 200) {
      console.log('✅ Order marked PAID successfully by Owner.');
    }

    // 11. Super Admin Login and Dashboard Metrics Fetch
    console.log('\n[11/11] Testing Super Admin Login & Dashboard access (/api/auth/admin/login)...');
    const adminLoginResponse = await axios.post(`${BASE_URL}/auth/admin/login`, {
      loginId: 'Jitu',
      password: 'admin123'
    });

    if (adminLoginResponse.status === 200) {
      console.log('✅ Admin login SUCCESS!');
      adminToken = adminLoginResponse.data.token;
      const adminHeaders = { Authorization: `Bearer ${adminToken}` };

      // Fetch admin dashboard details
      const adminDashboardResponse = await axios.get(`${BASE_URL}/admin/stats`, { headers: adminHeaders });
      if (adminDashboardResponse.status === 200) {
        console.log('✅ Admin dashboard stats successfully retrieved!');
        console.log(`   - Registered Merchants: ${adminDashboardResponse.data.totalOwners || 0}`);
      }
    }

    console.log('\n================================================================');
    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY WITHOUT EXCEPTION!');
    console.log('================================================================');

  } catch (err) {
    console.error('\n❌ TEST RUN FAILED!');
    if (err.response) {
      console.error(`Error status: ${err.response.status}`);
      console.error('Error message:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
};

runTests();
