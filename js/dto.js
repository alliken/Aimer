function User(userId, name, login, email, password) {
    this.userId = userId;
    this.name = name;
    this.login = login;
    this.email = email;
    this.password = password;
}

function NewPassword(token, password) {
    this.token = token;
    this.password = password;
}

function Aim(id, title, description, dateOfStart, dateOfEnd, markedUsers,
             commentsAccess, access, stepSet) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dateOfStart = dateOfStart;
    this.dateOfEnd = dateOfEnd;
//    this.deletionDate = deletionDate;
    this.markedUsers = markedUsers;
    this.commentsAccess = commentsAccess;
  //  this.deliverableArea = deliverableArea;
    this.access = access;
    this.stepSet = stepSet;
}

function Step(id, title, description, dateOfStart, dateOfEnd, markedUsers, priority, worktype, subSteps) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dateOfStart = dateOfStart;
    this.dateOfEnd = dateOfEnd;
//    this.deletionDate = deletionDate;
    this.markedUsers = markedUsers;
    this.priority = priority;
    this.worktype = worktype;
    this.subSteps = subSteps;
}

//function Step() {
//
//    var reference = this;
//
//    this.newStep = function (builder) {
//        this.id = builder.id;
//        this.title = builder.title;
//        this.description = builder.description;
//        this.dateOfStart = builder.dateOfStart;
//        this.dateOfEnd = builder.dateOfEnd;
//        this.deletionDate = builder.deletionDate;
//        this.markedUsers = builder.markedUsers;
//        this.priority = builder.priority;
//        this.worktype = builder.worktype;
//        this.subSteps = builder.subSteps;
//        return this;
//    };
//
//    this.Builder = function () {
//
//        this.id = null;
//        this.title = null;
//        this.description = null;
//        this.dateOfStart = null;
//        this.dateOfEnd = null;
//        this.deletionDate = null;
//        this.markedUsers = null;
//        this.priority = null;
//        this.worktype = null;
//        this.subSteps = null;
//
//        this.build = function () {
//            return reference.newStep(this);
//        };
//
//        this.setId = function (id) {
//            this.id = id;
//            return this;
//        };
//        this.setTitle = function (title) {
//            this.title = title;
//            return this;
//        };
//        this.setDescription = function (description) {
//            this.description = description;
//            return this;
//        };
//        this.setDateOfStart = function (dateOfStart) {
//            this.dateOfStart = dateOfStart;
//            return this;
//        };
//        this.setDateOfEnd = function (dateOfEnd) {
//            this.dateOfEnd = dateOfEnd;
//            return this;
//        };
//        this.setDeletionDate = function (deletionDate) {
//            this.deletionDate = deletionDate;
//            return this;
//        };
//        this.setMarkedUsers = function (markedUsers) {
//            this.markedUsers = markedUsers;
//            return this;
//        };
//        this.setPriority = function (priority) {
//            this.priority = priority;
//            return this;
//        };
//        this.setWorkType = function (worktype) {
//            this.worktype = worktype;
//            return this;
//        };
//        this.setSubSteps = function (subSteps) {
//            this.subSteps = subSteps;
//            return this;
//        };
//    };
//}

//var step = new (new Step()).Builder()
//    .setId(137)
//    .setPriority(5)
//    .setTitle("Super Builder")
//    .build();

//function SubStep(id, title, description, dateOfStart, dateOfEnd, deletionDate, markedUsers, priority, worktype) {
//    this.id = id;
//    this.title = title;
//    this.description = description;
//    this.dateOfStart = dateOfStart;
//    this.dateOfEnd = dateOfEnd;
//    this.deletionDate = deletionDate;
//    this.markedUsers = markedUsers;
//    this.priority = priority;
//    this.worktype = worktype;
//}

