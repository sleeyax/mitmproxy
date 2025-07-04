import { fetchApi } from "../utils";
import * as optionsEditorActions from "./ui/optionsEditor";
import { defaultState, Option, OptionsState } from "./_options_gen";
import { AppThunk } from "./index";
import { createAction, createSlice } from "@reduxjs/toolkit";

export interface OptionMeta<T> {
    value: T;
    choices?: T[];
    default: T;
    help: string;
    type: string;
}

export type OptionsStateWithMeta = {
    [name in Option]: OptionMeta<OptionsState[name]>;
};

export const OPTIONS_RECEIVE =
    createAction<OptionsStateWithMeta>("OPTIONS_RECEIVE");
export const OPTIONS_UPDATE =
    createAction<Partial<OptionsStateWithMeta>>("OPTIONS_UPDATE");

const THEME_KEY = "theme";
const DEFAULT_THEME = "system";
const readThemeFromStorage = () =>
    localStorage.getItem(THEME_KEY) || DEFAULT_THEME;
const writeThemeToStorage = (theme: string) =>
    localStorage.setItem(THEME_KEY, theme);

export { Option, defaultState };

const optionsSlice = createSlice({
    name: "options",
    initialState: {
        ...defaultState,
        web_theme: readThemeFromStorage(),
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(OPTIONS_RECEIVE, (state, action) => {
                const s = <OptionsState>{};
                for (const [name, { value }] of Object.entries(
                    action.payload,
                )) {
                    // Handle theme option client side only
                    // because the backend can't 'read' the user's theme preference by the time we receive the options
                    // as it is persisted in the browser's localStorage.
                    if (name === "web_theme") {
                        s[name] = state.web_theme;
                        continue;
                    }

                    s[name] = value;
                }
                return s;
            })
            .addCase(OPTIONS_UPDATE, (state, action) => {
                for (const [name, { value }] of Object.entries(
                    action.payload,
                )) {
                    state[name] = value;
                }
            });
    },
});

export default optionsSlice.reducer;

export async function pureSendUpdate(option: Option, value, dispatch) {
    try {
        const response = await fetchApi.put("/options", {
            [option]: value,
        });
        if (response.status === 200) {
            dispatch(optionsEditorActions.updateSuccess({ option }));
        } else {
            throw await response.text();
        }
    } catch (error) {
        dispatch(
            optionsEditorActions.updateError({
                option,
                error: error.toString(),
            }),
        );
    }
}

export async function pureSendReset(dispatch) {
    const response = await fetchApi.put("/options", defaultState);
    if (response.status === 200) {
        dispatch(optionsEditorActions.resetSuccess());
    } else {
        throw await response.text();
    }
}

const sendUpdate = pureSendUpdate; // _.throttle(pureSendUpdate, 500, {leading: true, trailing: true})
const sendReset = pureSendReset;

export function update(name: Option, value: any): AppThunk {
    return (dispatch) => {
        dispatch(optionsEditorActions.startUpdate({ option: name, value }));
        sendUpdate(name, value, dispatch);
        if (name === "web_theme") {
            writeThemeToStorage(value);
        }
    };
}

export function reset(): AppThunk {
    return (dispatch) => {
        sendReset(dispatch);
    };
}

export function save() {
    return () => fetchApi("/options/save", { method: "POST" });
}

export function addInterceptFilter(example) {
    return (dispatch, getState) => {
        let intercept = getState().options.intercept;
        if (intercept && intercept.includes(example)) {
            return;
        }
        if (!intercept) {
            intercept = example;
        } else {
            intercept = `${intercept} | ${example}`;
        }
        dispatch(update("intercept", intercept));
    };
}
