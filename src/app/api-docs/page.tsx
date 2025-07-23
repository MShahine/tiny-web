import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Code, Globe, Zap, Shield, InfoIcon } from "lucide-react";

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">API Documentation</Badge>
        <h1 className="text-4xl font-bold mb-4">TinyWeb API</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Integrate TinyWeb's SEO tools into your applications with our RESTful API
        </p>
      </div>

      <Alert className="mb-8">
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Coming Soon:</strong> Our public API is currently in development. 
          Contact us for early access or enterprise solutions.
        </AlertDescription>
      </Alert>

      {/* API Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Globe className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">RESTful API</h3>
            <p className="text-sm text-muted-foreground">
              Standard HTTP methods with JSON responses
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Fast Response</h3>
            <p className="text-sm text-muted-foreground">
              Optimized for speed with intelligent caching
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Rate Limited</h3>
            <p className="text-sm text-muted-foreground">
              Fair usage policies with generous limits
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Code className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Easy Integration</h3>
            <p className="text-sm text-muted-foreground">
              Simple endpoints with comprehensive docs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Endpoints */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Available Endpoints</h2>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">GET</Badge>
                /api/tools/opengraph
              </CardTitle>
              <CardDescription>
                Analyze OpenGraph tags and social media previews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parameters:</h4>
                  <code className="text-sm bg-muted p-2 rounded block">
                    ?url=https://example.com
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
{`{
  "success": true,
  "data": {
    "title": "Page Title",
    "description": "Page description",
    "image": "https://example.com/image.jpg",
    "url": "https://example.com",
    "type": "website"
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">GET</Badge>
                /api/tools/meta-tags
              </CardTitle>
              <CardDescription>
                Analyze meta tags and SEO optimization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parameters:</h4>
                  <code className="text-sm bg-muted p-2 rounded block">
                    ?url=https://example.com
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
{`{
  "success": true,
  "data": {
    "title": "Page Title",
    "description": "Meta description",
    "keywords": ["keyword1", "keyword2"],
    "score": 85,
    "recommendations": [...]
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">GET</Badge>
                /api/tools/http-headers
              </CardTitle>
              <CardDescription>
                Analyze HTTP headers for security and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Parameters:</h4>
                  <code className="text-sm bg-muted p-2 rounded block">
                    ?url=https://example.com
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <pre className="text-sm bg-muted p-4 rounded overflow-x-auto">
{`{
  "success": true,
  "data": {
    "headers": {...},
    "security_score": 78,
    "performance_score": 92,
    "recommendations": [...]
  }
}`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Authentication */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Authentication</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              Currently, our API endpoints are publicly accessible with rate limiting. 
              API keys will be required for higher usage limits and premium features.
            </p>
            <div className="bg-muted p-4 rounded">
              <h4 className="font-semibold mb-2">Future API Key Usage:</h4>
              <code className="text-sm">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rate Limits */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Rate Limits</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Free Tier</CardTitle>
              <CardDescription>No API key required</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 10-20 requests per minute per tool</li>
                <li>• 1000 requests per day</li>
                <li>• Standard response times</li>
                <li>• Community support</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Premium Tier</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 100+ requests per minute</li>
                <li>• 50,000+ requests per day</li>
                <li>• Priority processing</li>
                <li>• Email support</li>
                <li>• Custom integrations</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact for API Access */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="pt-6 text-center">
          <h3 className="text-xl font-bold mb-2">Interested in API Access?</h3>
          <p className="mb-4 opacity-90">
            Contact us for early access, enterprise solutions, or custom integrations
          </p>
          <div className="space-y-2">
            <p className="text-sm">Email: api@tinyweb.tools</p>
            <p className="text-sm">Business: business@tinyweb.tools</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}