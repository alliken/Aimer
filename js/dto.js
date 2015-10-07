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

function Aim(id, title, description, dateOfStart, dateOfEnd, markedUsers, commentsAccess, access, stepList) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dateOfStart = dateOfStart;
    this.dateOfEnd = dateOfEnd;
    this.markedUsers = markedUsers;
    this.commentsAccess = commentsAccess;
    this.access = access;
    this.stepList = stepList;
}

function Step(id, title, description, dateOfStart, dateOfEnd, markedUsers, worktype, subSteps) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dateOfStart = dateOfStart;
    this.dateOfEnd = dateOfEnd;
    this.markedUsers = markedUsers;
    this.worktype = worktype;
    this.subSteps = subSteps;
}

