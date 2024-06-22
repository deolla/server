// server.js
import express from 'express';
import requestIp from 'request-ip';
import geoip from 'geoip-lite';

const app = express();

// Middleware to get client IP address
app.use(requestIp.mw());

// Function to clean IPv6 representation to IPv4
const cleanIPv6 = (ip) => {
  if (ip && ip.startsWith('::ffff:')) {
    return ip.slice(7); // Remove '::ffff:'
  }
  return ip;
};

// Function to clean special characters from visitor name
const cleanVisitorName = (name) => {
  return name.replace(/[\\/"]/g, ''); // Remove slashes, backslashes, and double quotes
};

// API endpoint
app.get('/api/hello', (req, res) => {
  // Get visitor_name from query parameters and clean special characters
  const visitor_name = cleanVisitorName(req.query.visitor_name || 'Guest');

  // Get client IP address and clean IPv6 representation
  const client_ip = cleanIPv6(req.clientIp);

  // Get location information based on IP address
  const geo = geoip.lookup(client_ip);

  // Prepare response
  let location = 'Location information not available';
  if (geo && geo.city) {
    location = geo.city;
  }

  // Construct plain text response
  const response = `{
    "client_ip": "${client_ip}",
    "location": "${location}",
    "greeting": "Hello, ${visitor_name}!"
  }`;

  // Send response
  res.type('json').send(response);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
