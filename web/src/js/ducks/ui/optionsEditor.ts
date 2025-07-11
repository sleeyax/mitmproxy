import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Option, OptionsState } from "../_options_gen";
import { HIDE_MODAL } from "./modal";

export interface OptionUpdate<T> {
    isUpdating: boolean;
    value: T;
    error: string | false;
}

type OptionsEditorState = Partial<{
    [name in Option]: OptionUpdate<OptionsState[name]>;
}>;

export const defaultState: OptionsEditorState = {};

const optionsEditorSlice = createSlice({
    name: "ui/optionsEditor",
    initialState: defaultState,
    reducers: {
        startUpdate(state, action: PayloadAction<{ option: any; value: any }>) {
            state[action.payload.option] = {
                isUpdating: true,
                value: action.payload.value,
                error: false,
            };
        },
        updateSuccess(state, action: PayloadAction<{ option: any }>) {
            state[action.payload.option] = undefined;
        },
        resetSuccess() {
            return defaultState;
        },
        updateError(
            state,
            action: PayloadAction<{ option: any; error: string | false }>,
        ) {
            let val = state[action.payload.option]!.value;
            if (typeof val === "boolean") {
                val = !val;
            }
            state[action.payload.option] = {
                value: val,
                isUpdating: false,
                error: action.payload.error,
            };
        },
    },
    extraReducers: (builder) => {
        // this action type comes from ducks/ui/modal.ts. Once it's received, the state is reset.
        builder.addCase(HIDE_MODAL, () => {
            return defaultState;
        });
    },
});

const { actions, reducer } = optionsEditorSlice;
export const { startUpdate, resetSuccess, updateSuccess, updateError } =
    actions;
export default reducer;
