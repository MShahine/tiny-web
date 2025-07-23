import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">Terms of Service</Badge>
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-xl text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <Alert className="mb-8">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          By using TinyWeb's services, you agree to these terms. Please read them carefully.
        </AlertDescription>
      </Alert>

      {/* Terms Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using TinyWeb ("the Service"), you accept and agree to be bound by 
          the terms and provision of this agreement. If you do not agree to abide by the above, 
          please do not use this service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          TinyWeb provides free SEO and web analysis tools including but not limited to:
        </p>
        <ul>
          <li>OpenGraph preview and validation</li>
          <li>Meta tags analysis and optimization suggestions</li>
          <li>HTTP headers security and performance analysis</li>
          <li>Sitemap discovery and validation</li>
          <li>Robots.txt testing and validation</li>
          <li>SERP ranking analysis</li>
          <li>Website crawling and technical SEO analysis</li>
          <li>Technology stack detection</li>
          <li>Page speed and performance insights</li>
          <li>Link extraction and analysis</li>
          <li>Social media preview generation</li>
        </ul>

        <h2>3. Acceptable Use</h2>
        <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
        <ul>
          <li>Use the Service to analyze websites you don't own or have permission to analyze</li>
          <li>Attempt to circumvent rate limits or security measures</li>
          <li>Use automated tools to abuse or overload the Service</li>
          <li>Attempt to reverse engineer, decompile, or extract the source code</li>
          <li>Use the Service for any illegal or unauthorized purpose</li>
          <li>Interfere with or disrupt the Service or servers</li>
          <li>Transmit any malicious code, viruses, or harmful content</li>
        </ul>

        <h2>4. Rate Limits and Fair Usage</h2>
        <p>
          To ensure fair access for all users, we implement rate limits:
        </p>
        <ul>
          <li>Rate limits are applied per IP address and per tool</li>
          <li>Typical limits range from 10-20 requests per minute per tool</li>
          <li>Excessive usage may result in temporary or permanent restrictions</li>
          <li>Commercial or high-volume usage requires prior approval</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are and will remain 
          the exclusive property of TinyWeb and its licensors. The Service is protected by 
          copyright, trademark, and other laws.
        </p>

        <h2>6. Privacy and Data</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy, which also governs 
          your use of the Service, to understand our practices.
        </p>

        <h2>7. Disclaimers and Limitations</h2>
        <h3>Service Availability</h3>
        <ul>
          <li>The Service is provided "as is" without warranties of any kind</li>
          <li>We don't guarantee uninterrupted or error-free service</li>
          <li>Maintenance and updates may cause temporary unavailability</li>
        </ul>

        <h3>Accuracy of Results</h3>
        <ul>
          <li>SEO analysis results are provided for informational purposes</li>
          <li>We don't guarantee the accuracy or completeness of analysis results</li>
          <li>Results should be verified independently for critical decisions</li>
        </ul>

        <h3>Limitation of Liability</h3>
        <p>
          In no event shall TinyWeb be liable for any indirect, incidental, special, 
          consequential, or punitive damages, including without limitation, loss of profits, 
          data, use, goodwill, or other intangible losses.
        </p>

        <h2>8. Termination</h2>
        <p>
          We may terminate or suspend your access immediately, without prior notice or liability, 
          for any reason whatsoever, including without limitation if you breach the Terms.
        </p>

        <h2>9. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
          If a revision is material, we will try to provide at least 30 days notice prior to any 
          new terms taking effect.
        </p>

        <h2>10. Governing Law</h2>
        <p>
          These Terms shall be interpreted and governed by the laws of the jurisdiction where 
          TinyWeb operates, without regard to its conflict of law provisions.
        </p>

        <h2>11. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us:
        </p>
        <ul>
          <li>Email: legal@tinyweb.tools</li>
          <li>General Contact: contact@tinyweb.tools</li>
          <li>GitHub: github.com/tinyweb-tools</li>
        </ul>

        <h2>12. Severability</h2>
        <p>
          If any provision of these Terms is held to be unenforceable or invalid, such provision 
          will be changed and interpreted to accomplish the objectives of such provision to the 
          greatest extent possible under applicable law and the remaining provisions will continue 
          in full force and effect.
        </p>
      </div>
    </div>
  );
}