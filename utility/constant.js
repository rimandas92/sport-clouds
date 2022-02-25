var config = require('../config');

module.exports.STATUS_MESSAGES = {
    REGISTER_SUCCESS: "User Successfully created.",
    REGISTER_FAIL: "Could not save user please check.",
    USER_AUTHENTICATED: "User Successfully Logged in.",
    USER_ALREADY_EXIST: "Sorry...! user already exist.",
    INTERNAl_DB_ERROR: "Internal DB error.",
    IMAGE_UPLOADED_FAILED: "Image uploaded Failed",
    SESSION_EXPIRED: "Sorry...! your session has timed out , please login again",
    AUTHENTICATION_FAILED: "Authentication failed",
    SUCCESSFULLY_CREATED: "Successfully created",
    ERROR_SAVING: "Could not save to to database please check",
    ALREADY_EXISTS: "Already exits",
    NOT_FOUND: "Not found",
    LOGGED_OUT: "Logout successfull",
    USER_DOES_NOT_EXIST: "User does not exist",
    IMAGE_UPLOADED_SUCCESSFULLY: "Image uploaded and updated successfully",
    EMAIL_REQUIRED: "Please add a valid email",
    USER_REQUIRED: "Please add a valid user name",
    USERTYPE_REQUIRED: "Please add a user type",
    PASSWORD_REQUIRED: "Please provide a passord",
    ACCOUNT_NOT_VERIFIED: "Sorry...! Your email has not been verified yet",
    SERVER_ERROR: "Internal server error"
}
module.exports.PATH_LOCATIONS = {
    uploadProfilePicPath           : "public/uploads/profilepic/",
    profilepicPath                 : "uploads/profilepic/",
    user_profile_pic_path_view     : config.file_base_url + 'public/uploads/profilepic/',

    uploadTeamProfilePicPath       : "public/uploads/team_image/",
    teamProfilePicPath             : "uploads/team_image/",
    team_profile_pic_path_view     : config.file_base_url,

    uploadPlayerProfilePicPath     : "public/uploads/playerProfilePic/",
    playerProfilePicPath           : "uploads/playerProfilePic/",
    
    uploadFlagIcon               : "public/uploads/flag_display_icons/",
    flagIconPath                 : "uploads/flag_display_icons/",
    flag_icon_path_view          : config.file_base_url + 'public/uploads/flag_display_icons/',

    uploadUserFiles               : "public/uploads/user_files/",
    userFilesPath                 : "uploads/user_files/",
    user_files_path_view          : config.file_base_url + 'public/uploads/user_files/',

    uploadTeamStore               : "public/uploads/team_store/",
    teamStorePath                 : "uploads/team_store/",
    team_store_path_view          : config.file_base_url + 'public/uploads/team_store/',
}
module.exports.URL_PATHS = {
    // user_verification_url: 'http://nodeserver.mydevfactory.com:6006/api/user_verification/',
    // user_reset_password_url: 'http://nodeserver.mydevfactory.com:6006/api/user_reset_password/',
}
module.exports.CONSTANTS = {
   
}
