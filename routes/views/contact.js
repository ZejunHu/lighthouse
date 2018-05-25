var keystone = require('keystone');
var Contact = keystone.list('Contact');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'contact';
	locals.subject = Contact.fields.subject.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.contactSubmitted = false;

	// On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'enquiry' }, function (next) {

		var newContact = new Contact.model();
		var updater = newContact.getUpdateHandler(req);

		updater.process(req.body, {
			flashErrors: true,
			fields: 'name, email, phone, subject, message',
			errorMessage: 'There was a problem submitting your enquiry:',
		}, function (err) {
			if (err) {
				locals.validationErrors = err.errors;
			} else {
				locals.contactSubmitted = true;
			}
			next();
		});
	});

	view.render('contact');
};
