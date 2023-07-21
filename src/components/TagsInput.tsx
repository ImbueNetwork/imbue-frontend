/* eslint-disable react-hooks/exhaustive-deps */
import React, { KeyboardEvent, useState } from 'react';

export type TagsInputProps = {
  tags: string[];
  suggestData: string[];
  onChange: (_tags: string[]) => void;
  limit?: number;
};

export const TagsInput = ({
  tags,
  suggestData,
  onChange,
  limit,
}: TagsInputProps): JSX.Element => {
  const [vtags, setTags] = useState<string[]>(tags);
  const [input, setInput] = useState<any>();

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
      if (limit && vtags.length >= limit) return;
      const newTags = [...vtags, input];
      setTags(newTags);
      setInput('');
      onChange(newTags);
    }
  };

  const addItem = (item: string) => {
    if (limit && vtags.length >= limit) return;
    const newTags = [...tags, item];
    setTags(newTags);
    onChange(newTags);
  };

  const handleChange = (text: string) => {
    const value = text;
    const sanitizedValue = value.replace(/[^\w\s]/gi, ''); // Regex to remove special characters

    setInput(sanitizedValue);

    if (sanitizedValue === '') {
      return;
    }
  };

  return (
    <>
      <div className='selected-tags'>
        {tags?.map((tag, i) => (
          <div
            key={i}
            className='selected-tag-item cursor-pointer !bg-white'
            onClick={() => handleDelete(i)}
          >
            {tag}
            <div data-testid='unselect-tag' className='unselect-tag'>
              x
            </div>
          </div>
        ))}
        <input
          type='text'
          className='new-tag-input text-black'
          data-testid='tag-input'
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className='tags-suggestion-container'>
        {suggestData
          .filter((item: string) => vtags?.indexOf(item) === -1)
          .map((item, index) => (
            <div
              className='tag-suggestion'
              key={index}
              onClick={() => addItem(item)}
            >
              <span className='tag-suggestion-text font-extralight text-[0.875rem] text-[#3B27C1]'>
                {item}
              </span>
              <span className='tag-suggest-button'>+</span>
            </div>
          ))}
      </div>
    </>
  );
};
