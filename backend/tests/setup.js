// Runs before any test file is loaded, so auth.js sees JWT_SECRET
// at the moment it does `const JWT_SECRET = process.env.JWT_SECRET;`
process.env.JWT_SECRET = 'test-secret';
