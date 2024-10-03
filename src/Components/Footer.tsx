// const SvgFirst = () => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       stroke-width="2"
//       stroke-linecap="round"
//       stroke-linejoin="round"
//     >
//       <circle cx="12" cy="12" r="5" />
//       <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
//     </svg>
//   );
// };

// const SvgSecond = () => {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       width="20"
//       height="20"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       stroke-width="2"
//       stroke-linecap="round"
//       stroke-linejoin="round"
//     >
//       <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
//     </svg>
//   );
// };

const Footer = () => {
  return (
    <footer className="footer footer-center rounded bg-base-100 p-10 font-inter text-base-content">
      <nav className="grid grid-flow-col gap-4">
        <a className="link-hover link">Kontakt</a>
        <a className="link-hover link">Küpsiste kasutamine</a>
      </nav>
      <nav>
        <div className="grid grid-flow-col gap-4">
          {/* <label className="flex cursor-pointer gap-2">
            <SvgFirst></SvgFirst>
            <input
              data-toggle-theme="dark,emerald"
              type="checkbox"
              value="dark"
              className="toggle theme-controller"
            />
            <SvgSecond></SvgSecond>
          </label> */}
        </div>
      </nav>
    </footer>
  );
};

export default Footer;
