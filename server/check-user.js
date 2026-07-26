const u = db.getSiblingDB("dehneshin").users.findOne({username:"admin"})
print("role=" + u.role + " pwd=" + (u.password || "").substring(0, 30))
