import Head from 'next/head'
import Navbar from '../components/Navbar'
import SingleUpload from '../components/SingleUpload'
import MultipleUpload from '../components/MultipleUpload'
import { useState } from "react";

export default function Home() {
    const [activeComponent, setActiveComponent] = useState(null);

    const renderActiveComponent = () => {
        switch(activeComponent) {
            case 'single':
                return <SingleUpload />;
            case 'multiple':
                return <MultipleUpload />;
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-400">
                            <h2 className="text-2xl font-bold mb-4">Welcome to Upload Center</h2>
                            <p>Select an upload option from the sidebar to get started</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Head>
                <title>Sharon</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="bg-black min-h-screen">
                <Navbar />
                <div className="bg-black flex h-screen">
                    
                    {/* Left Sidebar */}
                    <aside className="w-64 h-full bg-gray-900 border-r border-gray-700">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-6">Upload Options</h2>
                            <nav className="space-y-4">
                                <button
                                    onClick={() => setActiveComponent('single')}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                                        activeComponent === 'single'
                                            ? 'bg-sharon-or text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    Single Upload
                                </button>
                                <button
                                    onClick={() => setActiveComponent('multiple')}
                                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors ${
                                        activeComponent === 'multiple'
                                            ? 'bg-sharon-or text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`}
                                >
                                    Multiple Upload
                                </button>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 h-full">
                        <div className="h-full flex items-center justify-center p-8">
                            {renderActiveComponent()}
                        </div>
                    </main>

                </div>
            </main>
        </>
    )
}