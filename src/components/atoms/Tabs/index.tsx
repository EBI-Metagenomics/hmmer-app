import { useState } from "react";

import "./index.scss";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  return (
    <>
      <div className="vf-tabs">
        <ul className="vf-tabs__list">
          {tabs.map((tab) => (
            <li key={tab.id} className="vf-tabs__item">
              <a
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`vf-tabs__link ${
                  activeTab === tab.id ? "is-active" : ""
                }`}
              >
                {tab.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="vf-tabs__content ">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`${tab.id}-tab`}
            role="tabpanel"
            aria-labelledby={tab.id}
            className="vf-tabs__section tabs-content"
            hidden={activeTab !== tab.id}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </>
  );
};
