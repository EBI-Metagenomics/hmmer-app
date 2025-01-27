interface MenuSectionProps {
  collapsible?: boolean;
  title: string;
  children: React.ReactNode;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  collapsible,
  title,
  children,
}) => {
  return (
    <>
      <div className="embl-grid">
        <div className="vf-section-header">
          <h2 className="vf-section-header__heading">{title}</h2>
        </div>
        <div>{children}</div>
      </div>
      <hr className="vf-divider menu-section-divider" />
    </>
  );
};
