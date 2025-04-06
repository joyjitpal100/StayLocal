import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/help" className="text-gray-600 hover:text-primary">Help Center</Link></li>
              <li><Link href="/safety" className="text-gray-600 hover:text-primary">Safety information</Link></li>
              <li><Link href="/cancellation" className="text-gray-600 hover:text-primary">Cancellation options</Link></li>
              <li><Link href="/report" className="text-gray-600 hover:text-primary">Report neighborhood concern</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Community</h3>
            <ul className="space-y-3">
              <li><Link href="/host-info" className="text-gray-600 hover:text-primary">StayLocal for Hosts</Link></li>
              <li><Link href="/guarantee" className="text-gray-600 hover:text-primary">Host Guarantee</Link></li>
              <li><Link href="/resources" className="text-gray-600 hover:text-primary">Resource Center</Link></li>
              <li><Link href="/forum" className="text-gray-600 hover:text-primary">Community forum</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Hosting</h3>
            <ul className="space-y-3">
              <li><Link href="/become-host" className="text-gray-600 hover:text-primary">Try hosting</Link></li>
              <li><Link href="/responsible-hosting" className="text-gray-600 hover:text-primary">Responsible hosting</Link></li>
              <li><Link href="/insurance" className="text-gray-600 hover:text-primary">Host protection insurance</Link></li>
              <li><Link href="/success-stories" className="text-gray-600 hover:text-primary">Host success stories</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-gray-900 mb-4">About</h3>
            <ul className="space-y-3">
              <li><Link href="/how-it-works" className="text-gray-600 hover:text-primary">How StayLocal works</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-primary">Contact us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-300 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <p className="text-gray-600">© {new Date().getFullYear()} StayLocal, Inc.</p>
            <span className="mx-2 text-gray-600">·</span>
            <Link href="/privacy" className="text-gray-600 hover:text-primary">Privacy</Link>
            <span className="mx-2 text-gray-600">·</span>
            <Link href="/terms" className="text-gray-600 hover:text-primary">Terms</Link>
            <span className="mx-2 text-gray-600">·</span>
            <Link href="/sitemap" className="text-gray-600 hover:text-primary">Sitemap</Link>
          </div>
          
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-primary">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-primary">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-primary">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-primary">
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
