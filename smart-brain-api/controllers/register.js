const handleRegister = (req, res, db, bcrypt) => {
  const { name, email, mobile, password, imageUrl } = req.body;

  console.log('Received registration data:', req.body);

  if (!name || !email || !mobile || !password || !imageUrl) {
    console.log('Incomplete registration details');
    return res.status(400).json('Incomplete registration details');
  }

  const hash = bcrypt.hashSync(password);
  console.log('Hashed password:', hash);

  db.transaction(trx => {
    trx.insert({
      user_name: name,
      user_email: email,
      mobile: mobile,
      password: hash,
      created_on: new Date(),
      photo_url: imageUrl
    })
    .into('register_table')
    .returning('*')
    .then(user => {
      console.log('User registered:', user[0]);
      return trx.commit().then(() => res.json(user[0]));
    })
    .catch(err => {
      console.error('Transaction error during insert:', err);
      return trx.rollback().then(() => res.status(400).json('Unable to register'));
    });
  })
  .catch(err => {
    console.error('Error registering user:', err);
    res.status(400).json('Unable to register');
  });
};

module.exports = {
  handleRegister
};
