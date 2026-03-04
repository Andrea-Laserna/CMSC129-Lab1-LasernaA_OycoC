db.createUser({
  user: "anderrated",
  pwd: passwordPrompt(),
  roles: [ { role: "userAdminAnyDatabase", db: "admin" }, "readWriteAnyDatabase" ]
})

