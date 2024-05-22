const express = require('express');
router = express.Router();
loginController = require('./login-controller');
authMiddleware = require('./auth-middleware');
checkRole = require('./checkRole');
announcementController = require('./announcement');

//logout

router
    .route('/logout')
    .get(loginController.logout);


//login
router
    .route('/login/student')
    .post(loginController.studentLogin)

router
    .route('/login/coordinator')
    .post(loginController.coordinatorLogin)

router
    .route('/login/company')
    .post(loginController.companyLogin)

router
    .route('/register/company')
    .post(loginController.companyRegister)


router
    .route('/login/secretariat')
    .post(loginController.secretariatLogin)


//coordinator approves company registration
router
    .route('/evaluvate-registration')
    .get(checkRole.isCoordinator,loginController.getNotApprovedList)
    .post(loginController.evaluateRegistration)





//announcement
router
    .route('/get-announcement/:id')
    .get(announcementController.getInternshipAnnouncement);
 
router
    .route('/create-company-announcement')
    .post(announcementController.companyCreateInternshipAnnouncement);


router
    .route('/update-company-announcement')
    .put(announcementController.companyUpdateInternshipAnnouncement);

router
    .route('/delete-company-announcement')
    .delete(announcementController.companyDeleteInternshipAnnouncement)

router
    .route('/reject-announcement')
    .delete(announcementController.adminRejectAnnouncement)

router
    .route('/get-announcement')
    .get(announcementController.getInternshipAnnouncement)

module.exports = router;