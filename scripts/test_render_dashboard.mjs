import fs from 'fs';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

// Let's inspect AdminDashboard and AdminContext exports
import * as AdminContextModule from '../src/context/AdminContext.jsx';
console.log('AdminContextModule keys:', Object.keys(AdminContextModule));
