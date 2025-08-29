function ok(res, data, status=200) { return res.status(status).json({ success: true, data }); }
function created(res, data) { return ok(res, data, 201); }
function badRequest(res, message) { return res.status(400).json({ success: false, message }); }
module.exports = { ok, created, badRequest };
