import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Github, Twitter, Clock, MapPin, X, GitBranchPlusIcon } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge variant="secondary" className="mb-4">Get in Touch</Badge>
        <h1 className="text-4xl lg:text-5xl font-bold mb-6">
          Contact Us
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have questions, suggestions, or need help with our SEO tools?
          We'd love to hear from you!
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Email Us</h3>
                  <p className="text-muted-foreground mb-2">
                    For general inquiries, support, or feedback
                  </p>
                  <Link
                    href="mailto:sofalcons@outlook.com"
                    className="text-primary hover:underline"
                  >
                    sofalcons@outlook.com
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <GitBranchPlusIcon className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">GitHub</h3>
                  <p className="text-muted-foreground mb-2">
                    Report bugs, request features, or contribute
                  </p>
                  <Link
                    href="https://github.com/LinuxCTRL"
                    className="text-primary hover:underline"
                  >
                    github.com/tinyweb-tools
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <X className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Twitter</h3>
                  <p className="text-muted-foreground mb-2">
                    Follow us for updates and SEO tips
                  </p>
                  <Link
                    href="https://x.com/am49811"
                    className="text-primary hover:underline"
                  >
                    @tinywebtools
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Response Times</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">General inquiries: 24-48 hours</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Bug reports: 12-24 hours</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Feature requests: 2-5 business days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Feedback & Suggestions
              </CardTitle>
              <CardDescription>
                Help us improve TinyWeb by sharing your thoughts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                We're constantly working to improve our tools and add new features.
                Your feedback helps us prioritize what matters most to our users.
              </p>
              <Button asChild className="w-full">
                <Link href="mailto:sofalcons@outlook.com">
                  Send Feedback
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Bug Reports
              </CardTitle>
              <CardDescription>
                Found an issue? Let us know so we can fix it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you encounter any bugs or unexpected behavior, please report them
                on GitHub with detailed steps to reproduce the issue.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="https://github.com/tinyweb-tools/issues">
                  Report Bug
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Inquiries</CardTitle>
              <CardDescription>
                Partnership opportunities and business questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Interested in partnerships, integrations, or have other business-related questions?
                We'd love to discuss opportunities.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="mailto:sofalcons@outlook.com">
                  Business Contact
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 pt-16 border-t">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold mb-2">Are all tools really free?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! All our SEO tools are completely free to use with no hidden costs,
              premium tiers, or credit card requirements.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a rate limit?</h3>
            <p className="text-sm text-muted-foreground">
              We have reasonable rate limits to ensure fair usage and optimal performance
              for all users. Most users never hit these limits.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I use the API?</h3>
            <p className="text-sm text-muted-foreground">
              We're working on a public API. Contact us if you're interested in
              early access or have specific integration needs.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">How can I contribute?</h3>
            <p className="text-sm text-muted-foreground">
              We welcome contributions! Check our GitHub repository for open issues,
              or reach out with your ideas for new tools or improvements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
