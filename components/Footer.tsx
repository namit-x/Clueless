import { FEATURES } from "@/lib/features";

const Footer = () => (
  <footer className="border-t border-border bg-card/50">
    <div className="section-container py-16">
      <div className="grid md:grid-cols-3 gap-10">
        <div>
          <h3 className="font-display text-lg font-bold text-primary mb-3 tracking-wider">AI & IoT Club</h3>
          <p className="text-muted-foreground text-sm">We are all Clueless.</p>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold mb-4 tracking-wider">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="/register" className="hover:text-primary transition-colors">Register</a>
            {FEATURES.LOGIN && (
              <a href="/login" className="hover:text-primary transition-colors">Login</a>
            )}
            <a href="/#rules" className="hover:text-primary transition-colors">Rules</a>
            <a href="/#faq" className="hover:text-primary transition-colors">FAQ</a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold mb-4 tracking-wider">Contact</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="mailto:wtfaiot@gmail.com" className="hover:text-primary transition-colors">wtfaiot@gmail.com</a>
            {/* <span>@aiot_club</span> */}
            <span>Jain University FET, Bengaluru</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-12 pt-6 text-center text-sm text-muted-foreground">
        © 2026 Neuron & Zigbee Club. All Rights Reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
