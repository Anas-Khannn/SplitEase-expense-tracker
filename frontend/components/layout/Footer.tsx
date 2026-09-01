import Link from "next/link";

const Footer = () => {
  return (
    <footer>
      <div className="text-muted-foreground mx-auto flex size-full max-w-360 items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6">
        <p className="text-sm text-balance max-sm:text-center">
          {`©${new Date().getFullYear()}`}{" "}
          <Link
            href="/dashboard"
            className="text-primary hover:underline"
          >
            SplitEase
          </Link>
          , Split expenses effortlessly
        </p>
        <div className="flex items-center gap-5 max-sm:hidden">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground text-sm transition duration-300"
          >
            Dashboard
          </Link>
          <Link
            href="/groups"
            className="text-muted-foreground hover:text-foreground text-sm transition duration-300"
          >
            Groups
          </Link>
          <Link
            href="/settings"
            className="text-muted-foreground hover:text-foreground text-sm transition duration-300"
          >
            Settings
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
