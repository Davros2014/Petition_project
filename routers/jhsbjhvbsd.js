// .post((req, res) => {
//      let { email, password } = req.body;
//      email = email.search(/.[@]./) == -1 ? null : email;
//      if (email && password) {
//          return db
//              .getUserByEmail(email.toLowerCase())
//              .then(user => {
//                  if (user.rows.length == 1) {
//                      let { first, last, id, sigId } = user.rows[0];
//                      let hash = user.rows[0].password;
//                      return bc
//                          .checkPassword(password, hash)
//                          .then(ismatch => {
//                              if (ismatch) {
//                                  req.session.user = {
//                                      first,
//                                      last,
//                                      email,
//                                      id,
//                                      sigId
//                                  };
//                                  res.redirect("/petition");
//                              } else {
//                                  //wrong password
//                                  req.session.error = "wrong password";
//                                  req.session.rememberEmail = email;
//                                  res.redirect("/login");
//                              }
//                          })
//                          .catch(err => {
//                              console.log(err);
//                              res.sendStatus(500);
//                          });
//                  } else {
//                      // no email found !
//                      req.session.error = "no such email.";
//                      req.session.promptReg = true;
//                      req.session.rememberEmail = email;
//                      res.redirect("/login");
//                  }
//              })
//              .catch(err => {
//                  //error in getUserByEmail or BC
//                  console.log(
//                      "error in getUserByEmail function or BC error",
//                      err
//                  );
//                  res.sendStatus(500);
//              });
//      } else {
//          req.session.error = "not valid email or password entered !";
//          req.session.rememberEmail = email;
//          res.redirect("/login");
//      }
//  });
