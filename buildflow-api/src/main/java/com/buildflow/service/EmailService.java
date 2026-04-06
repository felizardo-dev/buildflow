package com.buildflow.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final Resend resend;
    private final String fromEmail;

    public EmailService(
            @Value("${resend.api-key}") String apiKey,
            @Value("${resend.from-email}") String fromEmail) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }

    public void sendPasswordRecoveryEmail(String toEmail, String resetLink) {
        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                  <h2 style="color: #E8863A;">BuildFlow — Password Recovery</h2>
                  <p>You requested a password reset. Click the link below to set a new password:</p>
                  <p style="margin: 24px 0;">
                    <a href="%s"
                       style="background-color: #E8863A; color: #fff; padding: 12px 24px;
                              border-radius: 6px; text-decoration: none; font-weight: 600;">
                      Reset my password
                    </a>
                  </p>
                  <p style="color: #888; font-size: 13px;">
                    This link expires in 30 minutes. If you did not request a password reset, ignore this email.
                  </p>
                </div>
                """.formatted(resetLink);

        CreateEmailOptions options = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(toEmail)
                .subject("BuildFlow — Reset your password")
                .html(html)
                .build();

        try {
            resend.emails().send(options);
        } catch (ResendException e) {
            log.error("Failed to send password recovery email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendEmailChangeConfirmationEmail(String toEmail, String confirmLink) {
        String html = """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                  <h2 style="color: #E8863A;">BuildFlow — Confirm your new email</h2>
                  <p>You requested an email address change. Click the link below to confirm your new address:</p>
                  <p style="margin: 24px 0;">
                    <a href="%s"
                       style="background-color: #E8863A; color: #fff; padding: 12px 24px;
                              border-radius: 6px; text-decoration: none; font-weight: 600;">
                      Confirm new email
                    </a>
                  </p>
                  <p style="color: #888; font-size: 13px;">
                    This link expires in 24 hours. If you did not request this change, ignore this email.
                  </p>
                </div>
                """.formatted(confirmLink);

        CreateEmailOptions options = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(toEmail)
                .subject("BuildFlow — Confirm your new email address")
                .html(html)
                .build();

        try {
            resend.emails().send(options);
        } catch (ResendException e) {
            log.error("Failed to send email change confirmation to {}: {}", toEmail, e.getMessage());
        }
    }
}
