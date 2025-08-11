import React from 'react';
import i18n from 'i18next';
import '../../src/views/css/languageswitcher.css';

function LanguageSwitcher() {
  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="language-switcher-container">
      <select onChange={changeLanguage}>
        <option value="en">
           en
        </option>
        <option value="fr">
           fr
        </option>
        <option value="de">
           de
        </option>
        <option value="es">
           es
        </option>
      </select>
    </div>
  );
}

export default LanguageSwitcher;
