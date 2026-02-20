const Footer = () => (
  <footer className="border-t border-border bg-card/50">
    <div className="section-container py-16">
      <div className="grid md:grid-cols-3 gap-10">
        <div>
          <h3 className="font-display text-lg font-bold text-primary mb-3 tracking-wider">AI & IoT Club</h3>
          <p className="text-muted-foreground text-sm">Innovating Intelligence.</p>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold mb-4 tracking-wider">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <a href="/register" className="hover:text-primary transition-colors">Register</a>
            <a href="#" className="hover:text-primary transition-colors">Login</a>
            <a href="#rules" className="hover:text-primary transition-colors">Rules</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm font-bold mb-4 tracking-wider">Contact</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>email@college.edu</span>
            <span>@aiot_club</span>
            <span>XYZ College of Engineering</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-12 pt-6 text-center text-sm text-muted-foreground">
        © 2026 AI & IoT Club. All Rights Reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
