import React from 'react';
import Spline from '@splinetool/react-spline';

const SplineRefBlock = ({ url }) => {
    return (
        <div className='h-screen w-full'>
            <Spline scene={url} />
        </div>
    );
};

export default React.memo(SplineRefBlock);