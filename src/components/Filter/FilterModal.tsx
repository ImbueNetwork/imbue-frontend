import React from 'react';

import CustomModal from '@/components/CustomModal';

import CustomDropDown from '../CustomDropDown';


interface FilterModalProps {
    open: boolean;
    handleClose: () => void;
    cancelFilters: () => void;
    handleSetId: (_id: string | string[]) => void;
    onSearch: () => void;
    selectedFilterIds?: string[];
    customDropdownConfigs: any;
}

const FilterModal = ({ open, handleClose, customDropdownConfigs, cancelFilters, handleSetId, selectedFilterIds, onSearch }: FilterModalProps) => {
    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            className='flex justify-center items-center flex-wrap bg-black bg-opacity-50 top-0 left-0 w-full h-full z-[100] fixed'
        >
            <div
                onClick={(e: any) => {
                    e?.stopPropagation();
                }}
                className='bg-white rounded-2xl md:px-12 px-8 md:py-10 py-5 h-[450px] md:w-[60%] w-[95vw] self-center relative'
            >
                <p className='font-normal text-base !text-imbue-purple-dark !mb-9'>
                    Filter by:
                </p>

                {/* <div className='grid md:grid-cols-4 grid-cols-1 md:gap-10 gap-5'>
                    {customDropdownConfigs
                        ?.filter(({ options }: any) => options && options.length > 0)
                        ?.map(({ label, filterType, options }: any) => {
                            console.log(options);
                            return (
                                <Autocomplete
                                    key={label}
                                    multiple
                                    id="checkboxes-tags-demo"
                                    options={options}
                                    disableCloseOnSelect
                                    limitTags={0}
                                    getOptionLabel={(option:any) => option.value}
                                    renderOption={(props, option:any, { selected }) => (
                                        <li {...props}>
                                            <Checkbox
                                                // icon={icon}
                                                // checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {option.value}
                                        </li>
                                    )}
                                    style={{ width: 500 }}
                                    renderInput={(params) => (
                                        <TextField {...params} className='w-1/2' label={label} color='secondary' />
                                    )}
                                />
                            )
                        })}
                </div> */}
                <div className='grid md:grid-cols-4 grid-cols-1 md:gap-10 gap-5'>
                    {customDropdownConfigs
                        ?.filter(({ options }: any) => options && options.length > 0)
                        ?.map(({ label, filterType, options }: any) => (
                            <CustomDropDown
                                key={label}
                                name={label}
                                filterType={filterType}
                                filterOptions={options}
                                setId={handleSetId}
                                ids={selectedFilterIds}
                            />
                        ))}
                </div>

                <div className='h-[39px] text-center gap-5 flex items-center absolute md:bottom-10 bottom-5 right-10'>
                    <button
                        onClick={cancelFilters}
                        data-testid='Apply'
                        className='h-[39px] px-[20px] text-center justify-center w-[121px] rounded-[25px] bg-imbue-coral flex items-center cursor-pointer hover:scale-105 hover:bg-primary hover:text-content'
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            handleClose()
                            onSearch()
                        }}
                        data-testid='Apply'
                        className='h-[39px] px-[20px] text-center justify-center w-[121px] rounded-[25px] bg-imbue-purple flex items-center cursor-pointer hover:scale-105 hover:bg-primary hover:text-content'
                    >
                        Apply
                    </button>
                </div>
            </div>
        </CustomModal>
    );
};

export default FilterModal;

