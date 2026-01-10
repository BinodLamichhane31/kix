import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, Search, Sun, Moon, ArrowRight } from 'lucide-react';
import { appRoutes } from '../../utils/navigation';
import { useAuth } from '../../store/contexts/AuthContext';
import { useCart } from '../../store/contexts/CartContext';

export function Navbar({ isDark, toggleTheme }) {
  const { isAuthenticated, user } = useAuth();
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null); // 'men' or 'women'
  const megaMenuRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchFormRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setActiveMegaMenu(null);
      }
      if (isSearchOpen && searchFormRef.current && !searchFormRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'New Arrivals', href: '/shop?onlyNew=true' },
    { label: 'Shop All', href: '/shop' },
    { label: 'Men', href: '/shop?gender=men', hasMegaMenu: true, type: 'men' },
    { label: 'Women', href: '/shop?gender=women', hasMegaMenu: true, type: 'women' },
    { label: 'Customize', href: '/customize' },
  ];

  const isLinkActive = (link) => {
    const path = location.pathname;
    const gender = (searchParams.get('gender') || '').toLowerCase();
    const onlyNew = searchParams.get('onlyNew') === 'true';

    switch (link.label) {
      case 'New Arrivals':
        return path === '/shop' && onlyNew;
      case 'Shop All':
        return path === '/shop' && !onlyNew && (!gender || gender === 'all');
      case 'Men':
        return path === '/shop' && gender === 'men';
      case 'Women':
        return path === '/shop' && gender === 'women';
      case 'Customize':
        return path.startsWith('/customize');
      default:
        return false;
    }
  };

  const linkClassNames = (link) => {
    const active = isLinkActive(link);
    const base =
      'relative inline-flex items-center pb-1 text-sm font-medium uppercase tracking-wide transition-colors duration-200 after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:rounded-full after:transition-all after:duration-200';
    const activeStyles = 'text-brand-black dark:text-brand-accent after:bg-current after:opacity-100';
    const inactiveStyles =
      'text-gray-600 dark:text-gray-300 hover:text-brand-black dark:hover:text-brand-accent after:bg-current after:opacity-0';
    return `${base} ${active ? activeStyles : inactiveStyles}`;
  };

  const closeMenus = () => {
    setActiveMegaMenu(null);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  };

  const buildShopLink = (params = {}) => {
    const query = new URLSearchParams(params);
    return `/shop?${query.toString()}`;
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const value = searchQuery.trim();
    if (!value) return;
    navigate(`/shop?search=${encodeURIComponent(value)}`);
    setSearchQuery('');
    setIsSearchOpen(false);
    closeMenus();
  };

  const mensMenuData = {
    types: ['Lifestyle', 'Running', 'Basketball', 'Limited Edition'],
    filters: ['New Arrivals', 'Best Sellers', 'Customizable'],
    colors: [
      { name: 'White', value: 'white' },
      { name: 'Black', value: 'black' },
      { name: 'Red', value: 'red' },
      { name: 'Blue', value: 'blue' },
    ],
  };

  const womensMenuData = {
    types: ['Lifestyle', 'Running', 'Limited Edition'],
    filters: ['New Arrivals', 'Trending', 'Customizable'],
    colors: [
      { name: 'White', value: 'white' },
      { name: 'Black', value: 'black' },
      { name: 'Pink', value: 'pink' },
      { name: 'Beige', value: 'beige' },
    ],
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 border-b ${
        isScrolled || isMobileMenuOpen
          ? 'bg-white/90 dark:bg-brand-black/95 backdrop-blur-md border-gray-200 dark:border-white/10 py-4 shadow-sm dark:shadow-none'
          : 'bg-transparent border-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white italic">
              KIX<span className="text-brand-accent">.</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 relative" ref={megaMenuRef}>
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.hasMegaMenu && setActiveMegaMenu(link.label.toLowerCase())}
                onMouseLeave={() => link.hasMegaMenu && setActiveMegaMenu(null)}
              >
                {link.href.startsWith('/') ? (
                  <Link
                    to={link.href}
                    className={linkClassNames(link)}
                    onClick={closeMenus}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className={linkClassNames(link)}
                    onClick={closeMenus}
                  >
                    {link.label}
                  </a>
                )}
                
                {/* Men's Mega Menu */}
                {activeMegaMenu === 'men' && link.label === 'Men' && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-[600px] bg-white dark:bg-brand-black border border-gray-200 dark:border-white/10 rounded-lg shadow-xl dark:shadow-2xl p-8 z-50"
                    onMouseEnter={() => setActiveMegaMenu('men')}
                    onMouseLeave={() => setActiveMegaMenu(null)}
                  >
                    <div className="grid grid-cols-3 gap-8">
                      {/* Column 1 - Sneaker Types */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                          Sneaker Types
                        </h3>
                        <ul className="space-y-3">
                          {mensMenuData.types.map((type) => {
                            const slug = type.toLowerCase().replace(/\s+/g, '-');
                            return (
                              <li key={type}>
                                <Link
                                  to={buildShopLink({ gender: 'men', category: slug })}
                                  className="text-sm text-gray-900 dark:text-white hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                                  onClick={closeMenus}
                                >
                                  {type}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Column 2 - Quick Filters */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                          Quick Filters
                        </h3>
                        <ul className="space-y-3">
                          {mensMenuData.filters.map((filter) => {
                            const normalized = filter.toLowerCase().replace(/\s+/g, '-');
                            const filterParams =
                              normalized === 'new-arrivals'
                                ? { gender: 'men', onlyNew: 'true' }
                                : normalized === 'best-sellers'
                                ? { gender: 'men', sort: 'rating' }
                                : { gender: 'men', sort: 'featured' };
                            return (
                              <li key={filter}>
                                <Link
                                  to={buildShopLink(filterParams)}
                                  className="text-sm text-gray-900 dark:text-white hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                                  onClick={closeMenus}
                                >
                                  {filter}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Column 3 - Colors */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                          Colors
                        </h3>
                        <ul className="space-y-3">
                          {mensMenuData.colors.map((color) => (
                            <li key={color.name} className="flex items-center gap-3">
                              <span
                                className="w-4 h-4 rounded-full border border-gray-300 dark:border-white/20"
                                style={{
                                  backgroundColor:
                                    color.value === 'white'
                                      ? '#ffffff'
                                      : color.value === 'black'
                                      ? '#000000'
                                      : color.value === 'red'
                                      ? '#ef4444'
                                      : color.value === 'blue'
                                      ? '#3b82f6'
                                      : '#ffffff',
                                  borderColor: color.value === 'white' ? '#e5e7eb' : 'transparent',
                                }}
                              />
                              <Link
                                to={buildShopLink({ gender: 'men', color: color.value })}
                                className="text-sm text-gray-900 dark:text-white hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                                onClick={closeMenus}
                              >
                                {color.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Women's Mega Menu */}
                {activeMegaMenu === 'women' && link.label === 'Women' && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-[600px] bg-white dark:bg-brand-black border border-gray-200 dark:border-white/10 rounded-lg shadow-xl dark:shadow-2xl p-8 z-50"
                    onMouseEnter={() => setActiveMegaMenu('women')}
                    onMouseLeave={() => setActiveMegaMenu(null)}
                  >
                    <div className="grid grid-cols-3 gap-8">
                      {/* Column 1 - Sneaker Types */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                          Sneaker Types
                        </h3>
                        <ul className="space-y-3">
                          {womensMenuData.types.map((type) => {
                            const slug = type.toLowerCase().replace(/\s+/g, '-');
                            return (
                              <li key={type}>
                                <Link
                                  to={buildShopLink({ gender: 'women', category: slug })}
                                  className="text-sm text-gray-900 dark:text-white hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                                  onClick={closeMenus}
                                >
                                  {type}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Column 2 - Quick Filters */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                          Quick Filters
                        </h3>
                        <ul className="space-y-3">
                          {womensMenuData.filters.map((filter) => {
                            const normalized = filter.toLowerCase().replace(/\s+/g, '-');
                            const filterParams =
                              normalized === 'new-arrivals'
                                ? { gender: 'women', onlyNew: 'true' }
                                : normalized === 'trending'
                                ? { gender: 'women', sort: 'newest' }
                                : { gender: 'women', sort: 'featured' };
                            return (
                              <li key={filter}>
                                <Link
                                  to={buildShopLink(filterParams)}
                                  className="text-sm text-gray-900 dark:text-white hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                                  onClick={closeMenus}
                                >
                                  {filter}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      {/* Column 3 - Colors */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                          Colors
                        </h3>
                        <ul className="space-y-3">
                          {womensMenuData.colors.map((color) => (
                            <li key={color.name} className="flex items-center gap-3">
                              <span
                                className="w-4 h-4 rounded-full border border-gray-300 dark:border-white/20"
                                style={{
                                  backgroundColor:
                                    color.value === 'white'
                                      ? '#ffffff'
                                      : color.value === 'black'
                                      ? '#000000'
                                      : color.value === 'pink'
                                      ? '#ec4899'
                                      : color.value === 'beige'
                                      ? '#f5f5dc'
                                      : '#ffffff',
                                  borderColor: color.value === 'white' ? '#e5e7eb' : 'transparent',
                                }}
                              />
                              <Link
                                to={buildShopLink({ gender: 'women', color: color.value })}
                                className="text-sm text-gray-900 dark:text-white hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                                onClick={closeMenus}
                              >
                                {color.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-6 text-gray-600 dark:text-white">
            <button 
              onClick={toggleTheme} 
              className="hover:text-brand-black dark:hover:text-brand-accent transition-colors"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-px h-4 bg-gray-300 dark:bg-white/20 mx-2"></div>
            <div className="relative" ref={searchFormRef}>
              <button
                className="hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                onClick={() => {
                  setIsSearchOpen((prev) => !prev);
                  setActiveMegaMenu(null);
                }}
                type="button"
                aria-label="Search products"
              >
                <Search size={20} />
              </button>
              {isSearchOpen && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="absolute right-0 mt-3 w-72 bg-white dark:bg-brand-gray border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 flex items-center gap-2"
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sneakers..."
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black hover:bg-brand-accent dark:hover:bg-white transition-colors"
                  >
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
            {isAuthenticated ? (
              <Link
                to={appRoutes.dashboard.root}
                className="hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                title={user?.name || 'Profile'}
              >
                <User size={20} />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to={appRoutes.auth.signIn}
                  className="text-sm font-semibold hover:text-brand-black dark:hover:text-brand-accent transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to={appRoutes.auth.signUp}
                  className="px-4 py-2 bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl text-sm font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            <Link
              to={appRoutes.cart}
              className="relative hover:text-brand-black dark:hover:text-brand-accent transition-colors"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-accent text-brand-black text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center text-gray-900 dark:text-white space-x-4">
            <button onClick={toggleTheme}>
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-brand-black border-b border-gray-200 dark:border-white/10 shadow-2xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              link.href.startsWith('/') ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="block px-3 py-4 rounded-md text-base font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 hover:text-brand-black dark:hover:text-brand-accent uppercase"
                  onClick={closeMenus}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-4 rounded-md text-base font-bold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 hover:text-brand-black dark:hover:text-brand-accent uppercase"
                  onClick={closeMenus}
                >
                  {link.label}
                </a>
              )
            ))}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 px-3 py-3 border border-gray-200 dark:border-white/10 rounded-2xl">
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sneakers..."
                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black text-sm font-semibold"
              >
                Go
              </button>
            </form>
            <div className="mt-6 border-t border-gray-200 dark:border-white/10 pt-6">
              {isAuthenticated ? (
                <div className="flex justify-around">
                  <button
                    className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent"
                    onClick={() => {
                      mobileSearchInputRef.current?.focus();
                    }}
                  >
                    <Search size={20} className="mb-1" />
                    <span className="text-xs">Search</span>
                  </button>
                  <Link
                    to={appRoutes.dashboard.root}
                    className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent"
                    onClick={closeMenus}
                  >
                    <User size={20} className="mb-1"/>
                    <span className="text-xs">Profile</span>
                  </Link>
                  <Link
                    to={appRoutes.cart}
                    className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent"
                    onClick={closeMenus}
                  >
                    <div className="relative">
                      <ShoppingBag size={20} className="mb-1"/>
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-2 bg-brand-accent text-brand-black text-[8px] font-bold min-w-[14px] h-3.5 flex items-center justify-center rounded-full px-0.5">
                          {itemCount > 99 ? '99+' : itemCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs">Cart{itemCount > 0 ? ` (${itemCount})` : ''}</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to={appRoutes.auth.signIn}
                    className="block w-full px-4 py-3 text-center border border-gray-200 dark:border-white/10 rounded-xl text-sm font-semibold text-gray-900 dark:text-white hover:border-brand-black dark:hover:border-brand-accent transition-colors"
                    onClick={closeMenus}
                  >
                    Sign In
                  </Link>
                  <Link
                    to={appRoutes.auth.signUp}
                    className="block w-full px-4 py-3 text-center bg-brand-black dark:bg-brand-accent text-white dark:text-brand-black rounded-xl text-sm font-semibold hover:bg-brand-accent dark:hover:bg-white transition-colors"
                    onClick={closeMenus}
                  >
                    Sign Up
                  </Link>
                  <div className="flex justify-around pt-4 border-t border-gray-200 dark:border-white/10">
                    <button
                      className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent"
                      onClick={() => {
                        mobileSearchInputRef.current?.focus();
                      }}
                    >
                      <Search size={20} className="mb-1" />
                      <span className="text-xs">Search</span>
                    </button>
                    <Link
                      to={appRoutes.cart}
                      className="flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-brand-black dark:hover:text-brand-accent"
                      onClick={closeMenus}
                    >
                      <div className="relative">
                        <ShoppingBag size={20} className="mb-1"/>
                        {itemCount > 0 && (
                          <span className="absolute -top-1 -right-2 bg-brand-accent text-brand-black text-[8px] font-bold min-w-[14px] h-3.5 flex items-center justify-center rounded-full px-0.5">
                            {itemCount > 99 ? '99+' : itemCount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs">Cart{itemCount > 0 ? ` (${itemCount})` : ''}</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
