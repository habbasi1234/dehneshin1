print('Users: ' + db.users.countDocuments());
db.users.find({}, { username: 1, role: 1, _id: 0 }).forEach(u => printjson(u));
print('Customers: ' + db.customers.countDocuments({}));
print('Cust w/username: ' + db.customers.countDocuments({username: {$ne: null}}));
db.customers.find({}, { username: 1, name: 1, role: 1, tier: 1, _id: 0 }).limit(5).forEach(u => printjson(u));
