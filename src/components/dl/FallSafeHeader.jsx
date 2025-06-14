import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

const FallSafeHeader = () => {
	const navigate = useNavigate();

	return (
		<header className="w-full flex items-center h-16 px-8 bg-gray-900 border-b border-gray-800">
      <span
		  className="text-2xl font-bold tracking-tight text-white select-none cursor-pointer"
		  style={{
			  fontFamily:
				  'SF Pro Display, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
		  }}
		  onClick={() => navigate('/dl')}
	  >
        FallSafe
      </span>
			<nav className="ml-8 flex items-center">
				<Link
					to="/dl/video"
					className="text-white text-lg font-medium hover:text-blue-400 transition-colors duration-200"
				>
					Video Processing
				</Link>
			</nav>
		</header>
	);
};

export default FallSafeHeader;