const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/registrationDB", {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology:true
}).then(() => {
    console.log("Connection is established ;)");
}).catch((err) => {
    console.log(`Error happens :( -> error = ${err}`);
});
