var mongoose = require('./lib/mongoose');
// mongoose.set('debug', true);

const open = (resolve) => {
  mongoose.connection.on('open', resolve);
}

const dropDatabase = (resolve) => {
  var db = mongoose.connection.db;
  db.dropDatabase(resolve);
}

const requireModels = (resolve) => {
  require('./models/user');

  const models = Object.keys(mongoose.models);

  const modelsIndexes = models.map((modelName) => {
    return new Promise((callback) => {
      mongoose.models[modelName].ensureIndexes(callback);
    });
  });

  Promise
    .all(modelsIndexes)
    .then(resolve);
}

const createUsers = (resolve, reject) => {
  const usersData = [
    { username: "Вася", password: "secret" },
    { username: "Петя", password: "12345" },
    { username: "admin", password: "truehero" },
  ]

  const users = usersData.map((userData) => {
    const user = new mongoose.models.User(userData);
    return user.save();
  })

  Promise
    .all(users)
    .then((result) => {
      console.log(result);
      resolve();
    })
    .catch(reject);
}

const close = (resolve) => {
  mongoose.disconnect();
}

new Promise(open)
  .then(() => new Promise(dropDatabase))
  .then(() => new Promise(requireModels))
  .then(() => new Promise(createUsers))
  .finally(() => {
    mongoose.disconnect();
  });

// mongoose.connection.on('open', function() {
//   var db = mongoose.connection.db;

//   db.dropDatabase(function(err) {
//     if (err) throw err;

//     var vasya = new User({ username: "Вася", password: "secret" });
//     var peter = new User({ username: "Петя", password: "12345" });
//     var admin = new User({ username: "admin", password: "truehero" });

//     Promise
//       .all([vasya.save(), peter.save(), admin.save()])
//       .then((result) => {
//         console.log(result);
//         mongoose.disconnect();
//       });
//   })
// })
