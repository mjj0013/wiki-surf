import React, {createContext, useState}  from 'react';
const AppContext = createContext();

const user = window.__user || {displayName:'Anonymous'};
const INIT_STATE = {user};


const AppContextProvider = ({children}) => {
    const [app, setApp] = useState(INIT_STATE);

    return(
        <AppContext.Provider value={{app, setApp}}>
            {children}
        </AppContext.Provider>
    );
}

const AppContextConsumer = AppContext.Consumer;

export {AppContext, AppContextProvider, AppContextConsumer};
export default AppContext;

