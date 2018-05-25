var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Enquiry Model
 * =============
 */

var Contact = new keystone.List('Contact', {
	nocreate: true,
	noedit: true,
});

Contact.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true },
	phone: { type: String },
	subject: { type: Types.Select, options: ["投资规划", "税务规划", "退休规划", "房贷规划", "资产传承", "TFSA注册免税储蓄账户", "RESP注册教育基金计划", "RRSP注册退休储蓄计划、RRIF/LIF注册退休收入计划", "RDSP注册残疾储蓄计划", "旅游探亲保险", "人寿保险（Term/万通险/分红保险)", "团体福利险", "重疾保险/伤残保险/长期护理"] },
	message: { type: Types.Markdown, required: true },
	createdAt: { type: Date, default: Date.now },
});

Contact.schema.pre('save', function (next) {
	this.wasNew = this.isNew;
	next();
});

Contact.schema.post('save', function () {
	if (this.wasNew) {
		this.sendNotificationEmail();
	}
});

Contact.schema.methods.sendNotificationEmail = function (callback) {
	if (typeof callback !== 'function') {
		callback = function (err) {
			if (err) {
				console.error('There was an error sending the notification email:', err);
			}
		};
	}

	if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
		console.log('Unable to send email - no mailgun credentials provided');
		return callback(new Error('could not find mailgun credentials'));
	}

	var contact = this;
	var brand = keystone.get('brand');

	keystone.list('User').model.find().where('isAdmin', true).exec(function (err, admins) {
		if (err) return callback(err);
		new keystone.Email({
			templateName: 'contact-notification',
			transport: 'mailgun',
		}).send({
			to: "wisewealth@hotmail.com",
			from: {
				name: 'Affinity Financial',
				email: 'noreply@wisewealth.com',
			},
			subject: 'New Enquiry for Affinity Financial',
			contact: contact,
			brand: brand,
			layout: false,
		}, callback);
	});
};

Contact.defaultSort = '-createdAt';
Contact.defaultColumns = 'name, email, subject, createdAt';
Contact.register();
