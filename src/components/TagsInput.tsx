/* eslint-disable react-hooks/exhaustive-deps */
import React, { KeyboardEvent, useState } from 'react';

export type TagsInputProps = {
  tags: string[];
  suggestData: string[];
  onChange: (_tags: string[]) => void;
};

export const TagsInput = ({
  tags,
  suggestData,
  onChange,
}: TagsInputProps): JSX.Element => {
  const [vtags, setTags] = useState<string[]>(tags);
  const [input, setInput] = useState('');

  const handleDelete = (targetIndex: number) => {
    const newTags = tags.filter((_, index) => index !== targetIndex);
    setTags(newTags);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
    }
    if (['Tab', 'Enter'].includes(e.key) && input) {
      const newTags = [...vtags, input];
      setTags(newTags);
      setInput('');
      onChange(newTags);
    }
  };

  const addItem = (item: string) => {
    const newTags = [...tags, item];
    setTags(newTags);
    onChange(newTags);
  };

  return (
    <>
      <div className='selected-tags'>
        {tags.map((tag, i) => (
          <div
            key={i}
            className='selected-tag-item cursor-pointer'
            onClick={() => handleDelete(i)}
          >
            {tag}
            <div data-testid="unselect-tag" className="unselect-tag">
              x
            </div>
          </div>
        ))}
        <input
          type='text'
          className='new-tag-input text-black'
          data-testid='tag-input'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className='tags-suggestion-container'>
        {suggestData
          .filter((item: string) => vtags.indexOf(item) === -1)
          .map((item, index) => (
            <div
              className='tag-suggestion'
              key={index}
              onClick={() => addItem(item)}
            >
              <span className='tag-suggestion-text'>{item}</span>
              <span className='tag-suggest-button'>+</span>
            </div>
          ))}
      </div>
    </>
  );
};
