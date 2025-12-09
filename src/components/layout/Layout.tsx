import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  headerVariant?: "light" | "dark";
  showFooter?: boolean;
}

const Layout = ({ children, headerVariant = "light", showFooter = true }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFA]">
      <Header variant={headerVariant} />
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;

