import React from "react";
import { Link, useLocation } from "react-router";

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
      <>
      <nav className="vf-navigation vf-navigation--main | vf-cluster vf-u-padding__top--200">
        <ul className="vf-navigation__list | vf-list | vf-cluster__inner">
          <li className="vf-navigation__item">
            <Link
              to="/home"
              className="vf-navigation__link"
              aria-current={
                location.pathname.startsWith("/home") ? "page" : undefined
              }
            >
              Home
            </Link>
          </li>
          <li className="vf-navigation__item">
            <Link
              to="/search"
              className="vf-navigation__link"
              aria-current={
                location.pathname.startsWith("/search") ? "page" : undefined
              }
            >
              Search
            </Link>
          </li>
          <li className="vf-navigation__item">
            <Link
              to="/results"
              className="vf-navigation__link"
              aria-current={
                location.pathname.startsWith("/results") ? "page" : undefined
              }
            >
              Results
            </Link>
          </li>
          <li className="vf-navigation__item">
            <Link
              to="/software"
              className="vf-navigation__link"
              aria-current={
                location.pathname.startsWith("/software") ? "page" : undefined
              }
            >
              Software
            </Link>
          </li>
          <li className="vf-navigation__item">
            <Link
              to="/help"
              className="vf-navigation__link"
              aria-current={
                location.pathname.startsWith("/help") ? "page" : undefined
              }
            >
              Help
            </Link>
          </li>
          <li className="vf-navigation__item">
            <Link
              to="/about"
              className="vf-navigation__link"
              aria-current={
                location.pathname.startsWith("/about") ? "page" : undefined
              }
            >
              About
            </Link>
          </li>
          <li className="vf-navigation__item">
            <Link
              to="https://www.ebi.ac.uk/about/contact/support/hmmer"
              className="vf-navigation__link"
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>
      <hr />
      </>
  );
};

export default Navigation;
