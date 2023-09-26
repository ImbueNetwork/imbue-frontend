import {
  Checkbox,
  FormControl,
  FormControlLabel,
  RadioGroup,
} from '@mui/material';
import Image from 'next/image';
import { BiArrowBack } from 'react-icons/bi';

export default function VoteModal() {
  return (
    <div className='bg-white justify-center max-w-[31.938rem] px-12 text-center py-5 rounded-[18px]'>
      <div className='inline-block  bg-light-grey pt-2 pb-4 mt-12 mb-8  px-4 rounded-lg'>
        <Image src={'/confirm-icon.svg'} width={70} height={70} alt='icon' />
      </div>
      <h4 className='text-[27px]'>
        Was the funding utilized to achieve the set milestone goals?
      </h4>
      <p className='text-base mt-4 '>
        Vote in favour if you believe the milestones were achieved and funding
        was utilized judiciously.
      </p>

      <FormControl className='mt-7'>
        <RadioGroup
          aria-labelledby='demo-radio-buttons-group-label'
          defaultValue='female'
          name='radio-buttons-group'
          row
        >
          <FormControlLabel
            className='bg-[#F6F4FF] text-lg  rounded-xl pl-2 pr-12 '
            value='female'
            control={<Checkbox color='secondary' />}
            label='Yes,It Was'
          />
          <FormControlLabel
            className='bg-[#F6F4FF] ml-0.5 text-lg  rounded-xl pl-2 pr-12 py-2'
            value='male'
            control={<Checkbox color='secondary' />}
            label="No,It wasn't"
          />
        </RadioGroup>
      </FormControl>

      <button
        className='primary-btn  ml-auto in-dark w-button w-full '
        style={{ textAlign: 'center' }}
      >
        Vote
        <BiArrowBack className='rotate-180 ml-3 text-imbue-lime ' size={18} />
      </button>
    </div>
  );
}
