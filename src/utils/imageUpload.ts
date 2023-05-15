export const uploadPhoto = async (image: File) => {
	const formData = new FormData();
	formData.append('file', image);
	formData.append('upload_preset', 'Imbue-Freelancer-Profile');
    
    let data;
	try {
		data = await fetch(`https://api.cloudinary.com/v1_1/dzmn0ipe3/image/upload`, {
			method: 'POST',
			body: formData,
		}).then((res) => res.json());
	} catch (error) {
        data = error
        console.log(error);
    }

	return data;
};
