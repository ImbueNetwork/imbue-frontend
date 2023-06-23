import * as React from 'react';
import { ReactElement } from 'react';

export type DialogueProps = {
  title: string;
  content?: ReactElement;
  actionList: ReactElement;
  closeDialouge?: () => void;
};

export class Dialogue extends React.Component<DialogueProps> {
  constructor(props: DialogueProps) {
    super(props);
  }

  render() {
    return (
      <div
        onClick={() => {
          this.props?.closeDialouge && this.props?.closeDialouge();
        }}
        className='mdc-dialog mdc-dialog--open flex fixed top-0 left-0 items-center justify-center box-border w-full h-full bg-[#000000bf]'
        id='dialog'
      >
        <div className='mdc-dialog__container flex flex-row items-center justify-around box-border h-full'>
          <div
            className='mdc-dialog__surface pt-5'
            role='alertdialog'
            aria-modal='true'
            aria-labelledby='dialog-title'
            aria-describedby='dialog-content'
          >
            <h2
              className='mdc-dialog__title text-xl block relative flex-shrink-0 box-border mx-[24px] mb-[9px] font-medium'
              id='dialog-title'
            >
              {this.props.title}
            </h2>
            <div
              className='mdc-dialog__content py-[20px] px-[24px] text-[#ebeae2] text-base'
              id='dialog-content'
            >
              {this.props?.content}
              <ul className='mdc-deprecated-list mdc-deprecated-list--avatar-list'>
                {this.props.actionList}
              </ul>
            </div>
          </div>
        </div>
        <div className='mdc-dialog__scrim'></div>
      </div>
    );
  }
}
