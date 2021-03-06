module.exports =
    '<body style="padding: 0;margin: 0;font-family: Arial, Helvetica, sans-serif;">\
    <div style="width:600px;margin:0 auto;background-image: url({{ site_url }}uploads/email_template/top_bg.png);background-repeat: no-repeat; text-align: center;">\
        <img style="margin-top: 5%;" src="{{ site_url }}uploads/email_template/logo.png" alt="ezfoodie-logo">\
        <div style="margin-top: 8%;text-align: center;">\
            <ul style="list-style: none;">\
                <li style="color:#827f9e;font-size: 20px;">Welcome, {{ name }},</li>\
                <li>Thank you for using Fit Trip. Please use the link below to confirm your email address.</li>\
                <li style="margin-top:10px;">\
                <a href="{{ email_validation_url }}" class="button button--blue color-white" style="border-radius: 3px;font-family: tahoma; font-weight: 900; letter-spacing: 2px; font-size: 16px; mso-height-rule: exactly; text-align: center; text-decoration: none; display: block;">\
                <span style="color:#000">Confirm Email Address</span>\
                </a></li>\
            </ul>\
        </div>\
        <div style = "width: 100%; margin: 0 auto;">\
            <span style = "background-image: url({{ site_url }}uploads/email_template/button.png); height: 83px; display: flex; background-repeat: no-repeat; width: 100%; background-position: center;" >\
                <a style = "text-decoration: none; color:white; font-weight: 600;margin: 0 auto;margin-top: 30px;font-size: 17px;" > Start a new order </a>\
            </span>\
        </div>\
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-image: url({{ site_url }}uploads/email_template/footer_bg.png); height: 100px; text-align: center;">\
            <tbody>\
                <tr>\
                    <td style="text-align: center;">\
                        <img style="padding-left:13px;margin-top: 19px;" src="{{ site_url }}uploads/email_template/facebook.png">\
                        <img style="padding-left: 13px;margin-top: 19px;" src="{{ site_url }}uploads/email_template/instagram.png">\
                    </td>\
                </tr>\
            </tbody>\
        </table>\
    </div>\
</body>';