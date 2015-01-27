Alcohols = new Mongo.Collection("alcohols");
UserAlcohols = new Mongo.Collection('useralcohols');

Router.route('/', function () {
  // render the Home template with a custom data context
  this.render('Alcohols');
});

Router.route('/myalcohols', function () {
  // render the Home template with a custom data context
  this.render('MyAlcohols');
});

if (Meteor.isClient) {
    Meteor.subscribe("alcohols");
    Meteor.subscribe("userAlcohols");

  Template.Alcohols.helpers({
    alcohols: function(){
      return Alcohols.find({}, {sort:{name: 1}});
    }
  });
  
  Template.Alcohols.events({
    "submit .new-alcohol": function(event){
      var text = event.target.text.value;
      
     Meteor.call("addAlcohol", text);
      
      event.target.text.value = "";
      
      return false;
    },
    "click .toggle-owned": function (event) {
    // Set the checked property to the opposite of its current value
       Meteor.call("updateCollection", this._id, event.target.checked);
  },
  "click .delete": function () {
    Meteor.call("deleteAlcohol", this._id);
  }
  })
  
    Template.MyAlcohols.helpers({
    alcohols: function(){
      var myAlcohols = UserAlcohols.find({}, {sort:{name: 1}});
      var alcoholIds = myAlcohols.map(function(alcohol){ return alcohol.alcohol;})
      return Alcohols.find({_id: {$in: alcoholIds}});
    }
  });
  
    Template.MyAlcohols.events({ 
    "click .toggle-owned": function (event) {
       Meteor.call("updateCollection", this._id, event.target.checked);
  },
  "click .delete": function () {
    Meteor.call("deleteAlcohol", this._id);
  }
  });
    Template.alcohol.helpers({ 
      isOwner: function(){
        return UserAlcohols.find( {user: Meteor.userId(),alcohol: this._id, owned: true}).count() > 0;
      }
    });
  
Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});
}



if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  Meteor.publish("alcohols", function(){
          return Alcohols.find({});
  });
    Meteor.publish("userAlcohols", function(){
      return UserAlcohols.find({user: this.userId});
  });
}

Meteor.methods({
  addAlcohols: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Alcohols.insert({
      name: text,
      createdAt: new Date(),
      createdBy: Meteor.userId(),
      createdByUsername: Meteor.user().username
    });
  },
  deleteAlcohol: function (id) {
    //Alcohols.remove(id);
  },
  setOwned: function (id, setOwned) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    UserAlcohols.update({
        user: Meteor.userId(),
        alcohol:id
      }, {$set:{owned: setOwned}});
  },
  updateCollection: function (id, isOwned) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    var myalcohols = UserAlcohols.find( {user: Meteor.userId(),alcohol: this._id}).count();
    if (myalcohols === 0){
      UserAlcohols.insert({
      user: Meteor.userId(),
      alcohol: id,
      owned: isOwned
    });
    }else{
      UserAlcohols.update({
        user: Meteor.userId(),
        alcohol:id
      }, {$set:{owned: isOwned}});
    }
  }
});

