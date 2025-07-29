// Simple API test script
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let createdPostId = '';
let createdUserId = '';

// Test data
const timestamp = Date.now();
const testUser = {
  email: `test-${timestamp}@example.com`,
  name: 'Test User',
  password: 'password123'
};

const testPost = {
  title: 'Test Blog Post',
  content: 'This is a test blog post content.',
  published: false
};

async function testAPI() {
  console.log('🚀 Testing Blog API...\n');

  try {
    // 1. Test user signup
    console.log('1. Testing user signup...');
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    authToken = signupResponse.data.token;
    createdUserId = signupResponse.data.user.id;
    console.log('✅ Signup successful:', signupResponse.data.message);
    console.log('   User ID:', createdUserId);
    console.log('   Token received\n');

    // 2. Test user login
    console.log('2. Testing user login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...\n');

    // 3. Test get profile
    console.log('3. Testing get profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile retrieved successfully');
    console.log('   User:', profileResponse.data.user.name);
    console.log('   Posts count:', profileResponse.data.user._count.posts);
    console.log('');

    // 4. Test create post
    console.log('4. Testing create post...');
    const createPostResponse = await axios.post(`${BASE_URL}/posts`, testPost, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    createdPostId = createPostResponse.data.post.id;
    console.log('✅ Post created successfully');
    console.log('   Post ID:', createdPostId);
    console.log('   Title:', createPostResponse.data.post.title);
    console.log('');

    // 5. Test get user's posts
    console.log('5. Testing get user posts...');
    const userPostsResponse = await axios.get(`${BASE_URL}/posts/my-posts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ User posts retrieved successfully');
    console.log('   Posts count:', userPostsResponse.data.posts.length);
    console.log('   Total posts:', userPostsResponse.data.pagination.total);
    console.log('');

    // 6. Test update post
    console.log('6. Testing update post...');
    const updateData = {
      title: 'Updated Test Blog Post',
      content: 'This is the updated content.',
      published: true
    };
    const updatePostResponse = await axios.put(`${BASE_URL}/posts/${createdPostId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post updated successfully');
    console.log('   New title:', updatePostResponse.data.post.title);
    console.log('   Published:', updatePostResponse.data.post.published);
    console.log('');

    // 7. Test get all published posts
    console.log('7. Testing get all published posts...');
    const allPostsResponse = await axios.get(`${BASE_URL}/posts`);
    console.log('✅ Published posts retrieved successfully');
    console.log('   Published posts count:', allPostsResponse.data.posts.length);
    console.log('   Total published posts:', allPostsResponse.data.pagination.total);
    console.log('');

    // 8. Test get single post
    console.log('8. Testing get single post...');
    const singlePostResponse = await axios.get(`${BASE_URL}/posts/${createdPostId}`);
    console.log('✅ Single post retrieved successfully');
    console.log('   Post title:', singlePostResponse.data.post.title);
    console.log('   Author:', singlePostResponse.data.post.author.name);
    console.log('');

    // 9. Test delete post
    console.log('9. Testing delete post...');
    await axios.delete(`${BASE_URL}/posts/${createdPostId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post deleted successfully');
    console.log('');
    
    // Mark post as deleted so cleanup knows it's already gone
    createdPostId = null;

    console.log('🎉 All tests passed! The blog API is working correctly.');

    // Cleanup: Delete test user (this will also delete any remaining posts)
    console.log('\n🧹 Cleaning up test data...');
    try {
      // Delete the test user (this will cascade delete their posts)
      await axios.delete(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('   ✅ Test user deleted successfully');
      if (createdPostId) {
        console.log('   ✅ Test post deleted (cascaded)');
      } else {
        console.log('   ℹ️  Test post was already deleted in step 9');
      }
      console.log('   ✅ Test data cleanup completed');
    } catch (cleanupError) {
      console.log('   ⚠️  Cleanup warning:', cleanupError.response?.data?.error || cleanupError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Check if axios is installed
try {
  require('axios');
  testAPI();
} catch (error) {
  console.log('📦 Installing axios for testing...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install axios', { stdio: 'inherit' });
    console.log('✅ Axios installed successfully\n');
    testAPI();
  } catch (installError) {
    console.error('❌ Failed to install axios:', installError.message);
    console.log('\n💡 To run tests manually:');
    console.log('1. Install axios: npm install axios');
    console.log('2. Start the server: npm run dev');
    console.log('3. Run this script: node test-api.js');
  }
} 