import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, Database, Cookie } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">Privacy Policy</Badge>
        <h1 className="text-4xl font-bold mb-4">Your Privacy Matters</h1>
        <p className="text-xl text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Quick Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">No Personal Data</h3>
            <p className="text-xs text-muted-foreground">We don't collect personal information</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">No Tracking</h3>
            <p className="text-xs text-muted-foreground">No user behavior tracking</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Database className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Minimal Data</h3>
            <p className="text-xs text-muted-foreground">Only technical logs for security</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Cookie className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Essential Only</h3>
            <p className="text-xs text-muted-foreground">No unnecessary cookies</p>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Policy Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>1. Information We Collect</h2>
        <p>
          TinyWeb is designed with privacy in mind. We collect minimal information necessary 
          to provide our services:
        </p>
        <ul>
          <li><strong>URLs you analyze:</strong> Temporarily stored for processing, automatically deleted</li>
          <li><strong>Technical logs:</strong> IP addresses for rate limiting and security (retained for 30 days)</li>
          <li><strong>Usage statistics:</strong> Anonymous aggregated data for service improvement</li>
        </ul>

        <h2>2. How We Use Information</h2>
        <p>The limited information we collect is used solely for:</p>
        <ul>
          <li>Providing SEO analysis services</li>
          <li>Rate limiting to ensure fair usage</li>
          <li>Security monitoring and abuse prevention</li>
          <li>Service improvement and optimization</li>
        </ul>

        <h2>3. Data Storage and Security</h2>
        <p>
          We implement industry-standard security measures to protect any data we process:
        </p>
        <ul>
          <li>All data transmission is encrypted using HTTPS</li>
          <li>Analyzed URLs are processed in memory and not permanently stored</li>
          <li>Technical logs are automatically purged after 30 days</li>
          <li>No user accounts or personal profiles are created</li>
        </ul>

        <h2>4. Third-Party Services</h2>
        <p>
          TinyWeb may use third-party services for functionality. These services have their own privacy policies:
        </p>
        <ul>
          <li><strong>Hosting:</strong> Our hosting provider may have access to technical logs</li>
          <li><strong>CDN:</strong> Content delivery networks for improved performance</li>
          <li><strong>Analytics:</strong> Anonymous usage statistics (no personal data)</li>
        </ul>

        <h2>5. Cookies and Local Storage</h2>
        <p>
          We use minimal cookies and local storage:
        </p>
        <ul>
          <li><strong>Theme preference:</strong> Stores your dark/light mode choice</li>
          <li><strong>Rate limiting:</strong> Temporary tokens to manage usage limits</li>
          <li><strong>No tracking cookies:</strong> We don't use advertising or tracking cookies</li>
        </ul>

        <h2>6. Your Rights</h2>
        <p>
          Since we don't collect personal information, there's minimal data associated with you. However:
        </p>
        <ul>
          <li>You can clear your browser data to remove any local preferences</li>
          <li>You can contact us to request information about our data practices</li>
          <li>You can report any privacy concerns to our team</li>
        </ul>

        <h2>7. Children's Privacy</h2>
        <p>
          Our services are not directed to children under 13. We don't knowingly collect 
          information from children under 13. If you believe a child has provided information 
          to us, please contact us immediately.
        </p>

        <h2>8. International Users</h2>
        <p>
          TinyWeb is available globally. By using our services, you acknowledge that any 
          information may be transferred to and processed in countries where our servers 
          are located.
        </p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this privacy policy occasionally. Changes will be posted on this page 
          with an updated date. Continued use of our services after changes constitutes 
          acceptance of the updated policy.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have questions about this privacy policy or our data practices, 
          please contact us at:
        </p>
        <ul>
          <li>Email: privacy@tinyweb.tools</li>
          <li>GitHub: github.com/tinyweb-tools</li>
        </ul>
      </div>
    </div>
  );
}