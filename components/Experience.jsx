import Image from 'next/image';
import styles from '../styles/Experience.module.css';

const Experience = () => {
    return (
        <>
            <div className={styles.expContainer}>
                <h2>Scales Nature Park</h2>
                <div className={styles.expImage}>
                    <Image 
                        src='/images/scalesLogo.webp'
                        height={150}
                        width={150}
                    />
                </div>
            </div>

            <div>
                <div className={styles.expContent}>
                    <h2>Full Stack Application Developer</h2>
                    <ul>
                        <li>Led a small team of 2 developers through the development of full stack mobile and desktop applications.</li>
                        <li>Coordinated with management to gather software requirements for building workflow automation tools and applications.</li>
                    </ul>
                </div>
                
                <div className={styles.workPreview}>
                    <div className={styles.deviceContainer}>
                        <Image 
                        src='/images/phone.svg'
                        width={230}
                        height={415}
                        />
                    
                        <div className={styles.phoneContent}>
                            <Image 
                                src='/images/scalesPhoneApp.png'
                                width={200}
                                height={370}
                            />
                        </div>
                    </div>

                    <div className={styles.deviceContainer}>
                        <Image 
                            src='/images/desktop.svg'
                            width={800}
                            height={500}
                        />
                        
                        <div className={styles.desktopContent}>
                            <Image 
                                src='/images/scalesDesktopApp.png'
                                width={485}
                                height={270}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Experience;