'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';
import { apiFetch } from '@/lib/apiHelper';

// Register fonts for PDF (using standard fonts for now to avoid loading issues)
// In a real app, you'd register custom fonts like Roboto or Open Sans to support Arabic if needed
// However, the CV will be in German/English (Latin characters), so standard fonts work.

Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});

// Styles for PDF
const styles = StyleSheet.create({
    page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 30, fontFamily: 'Helvetica' },
    header: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#112233', paddingBottom: 10 },
    name: { fontSize: 24, fontWeight: 'bold', textTransform: 'uppercase', color: '#112233' },
    title: { fontSize: 14, color: '#556677', marginTop: 4 },
    contact: { fontSize: 10, marginTop: 4, color: '#334455' },
    section: { margin: 10, padding: 10, flexGrow: 1 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#CCCCCC', textTransform: 'uppercase', color: '#112233' },
    entryTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 8 },
    entrySubtitle: { fontSize: 10, fontStyle: 'italic', marginBottom: 2, color: '#556677' },
    entryDate: { fontSize: 10, color: '#777777', marginBottom: 4 },
    text: { fontSize: 10, lineHeight: 1.5, textAlign: 'justify' },
    skillItem: { fontSize: 10, marginRight: 10, padding: 4, backgroundColor: '#EEEEEE', borderRadius: 2 },
    skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
});

// PDF Document Component
const CvDocument = ({ data }: { data: any }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.name}>{data.personalInfo.firstName} {data.personalInfo.lastName}</Text>
                <Text style={styles.title}>{data.personalInfo.jobTitle}</Text>
                <Text style={styles.contact}>
                    {data.personalInfo.email} | {data.personalInfo.phone} | {data.personalInfo.address}
                    {data.personalInfo.linkedIn ? ` | ${data.personalInfo.linkedIn}` : ''}
                </Text>
            </View>

            {data.summary && (
                <View>
                    <Text style={styles.sectionTitle}>Profil</Text>
                    <Text style={styles.text}>{data.summary}</Text>
                </View>
            )}

            <View>
                <Text style={styles.sectionTitle}>Berufserfahrung</Text>
                {data.experience.map((exp: any, index: number) => (
                    <View key={index} style={{ marginBottom: 8 }}>
                        <Text style={styles.entryTitle}>{exp.title}</Text>
                        <Text style={styles.entrySubtitle}>{exp.company}, {exp.location}</Text>
                        <Text style={styles.entryDate}>{exp.startDate} - {exp.endDate}</Text>
                        <Text style={styles.text}>{exp.description}</Text>
                    </View>
                ))}
            </View>

            <View>
                <Text style={styles.sectionTitle}>Ausbildung</Text>
                {data.education.map((edu: any, index: number) => (
                    <View key={index} style={{ marginBottom: 8 }}>
                        <Text style={styles.entryTitle}>{edu.degree}</Text>
                        <Text style={styles.entrySubtitle}>{edu.institution}, {edu.location}</Text>
                        <Text style={styles.entryDate}>{edu.startDate} - {edu.endDate}</Text>
                        {edu.description && <Text style={styles.text}>{edu.description}</Text>}
                    </View>
                ))}
            </View>

            <View>
                <Text style={styles.sectionTitle}>Kenntnisse & Fähigkeiten</Text>
                <View style={styles.skillsContainer}>
                    {data.skills.map((skill: string, index: number) => (
                        <Text key={index} style={styles.skillItem}>{skill}</Text>
                    ))}
                </View>
            </View>

            <View>
                <Text style={styles.sectionTitle}>Sprachen</Text>
                <View style={styles.skillsContainer}>
                    {data.languages.map((lang: any, index: number) => (
                        <Text key={index} style={styles.skillItem}>{lang.language} ({lang.level})</Text>
                    ))}
                </View>
            </View>
        </Page>
    </Document>
);

import type { User } from '@/types/auth';

const CV_COST = 3;

interface Props {
    onBack: () => void;
    user: User | null;
    userCredits: number;
    setUserCredits: (credits: number) => void;
    onAuthRequired: () => void;
    onBuyCredits: () => void;
}

export default function CVBuilder({ onBack, user, userCredits, setUserCredits, onAuthRequired, onBuyCredits }: Props) {
    const { locale } = useApp();
    const [step, setStep] = useState<'type-selection' | 'form' | 'generating' | 'result'>('type-selection');
    const [cvType, setCvType] = useState<'design' | 'ats' | null>(null);

    // Form State
    const [personalInfo, setPersonalInfo] = useState({
        firstName: '', lastName: '', email: '', phone: '', address: '', jobTitle: '', linkedIn: ''
    });
    const [experience, setExperience] = useState([{ title: '', company: '', startDate: '', endDate: '', description: '', location: '' }]);
    const [education, setEducation] = useState([{ degree: '', institution: '', startDate: '', endDate: '', location: '', description: '' }]);
    const [skills, setSkills] = useState(['']);
    const [languages, setLanguages] = useState([{ language: '', level: '' }]);
    const [summary, setSummary] = useState('');

    const [generatedCV, setGeneratedCV] = useState<any>(null);

    const addExperience = () => setExperience([...experience, { title: '', company: '', startDate: '', endDate: '', description: '', location: '' }]);
    const removeExperience = (index: number) => setExperience(experience.filter((_, i) => i !== index));

    const addEducation = () => setEducation([...education, { degree: '', institution: '', startDate: '', endDate: '', location: '', description: '' }]);
    const removeEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));

    const addSkill = () => setSkills([...skills, '']);
    const removeSkill = (index: number) => setSkills(skills.filter((_, i) => i !== index));

    const addLanguage = () => setLanguages([...languages, { language: '', level: '' }]);
    const removeLanguage = (index: number) => setLanguages(languages.filter((_, i) => i !== index));

    const handleGenerate = async () => {
        if (!user) {
            onAuthRequired();
            return;
        }

        if (userCredits < CV_COST) {
            onBuyCredits();
            return;
        }

        setStep('generating');
        try {
            // Deduct credits first
            const creditRes = await apiFetch('/api/credits/deduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: CV_COST }),
            });

            const creditData = await creditRes.json();

            if (!creditData.success) {
                alert(creditData.error || (locale === 'ar' ? 'رصيد غير كافٍ' : 'Nicht genügend Guthaben'));
                setStep('form');
                return;
            }

            setUserCredits(creditData.credits);

            // Generate CV
            const response = await apiFetch('/api/cv/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    personalInfo,
                    experience,
                    education,
                    skills,
                    languages,
                    summary,
                    targetFormat: cvType
                }),
            });

            const data = await response.json();
            if (data.success) {
                setGeneratedCV(data.cvData);
                setStep('result');
            } else {
                alert('Error generating CV: ' + data.error);
                setStep('form');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred.');
            setStep('form');
        }
    };

    if (step === 'type-selection') {
        return (
            <div className="glass-card animate-scale-in">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button
                        onClick={onBack}
                        className="btn btn-ghost"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: locale === 'ar' ? '0' : '1rem',
                            marginLeft: locale === 'ar' ? '1rem' : '0',
                            padding: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--color-neutral-100)'
                        }}
                    >
                        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                            {locale === 'ar' ? '→' : '←'}
                        </span>
                    </button>
                    <h2 className="text-xl font-bold text-white">{locale === 'ar' ? 'إنشاء سيرة ذاتية' : 'Lebenslauf erstellen'}</h2>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                    {/* Design CV Option */}
                    <div className="feature-card" style={{ opacity: 0.6, cursor: 'not-allowed', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))' }}>
                        <div className="feature-icon" style={{ background: 'var(--color-primary-600)' }}>🎨</div>
                        <h3 className="feature-title">{locale === 'ar' ? 'سيرة ذاتية بتصميم' : 'Design-Lebenslauf'}</h3>
                        <p className="feature-desc">{locale === 'ar' ? 'قريباً...' : 'Bald verfügbar...'}</p>
                    </div>

                    {/* ATS CV Option */}
                    <div
                        onClick={() => { setCvType('ats'); setStep('form'); }}
                        className="feature-card"
                        style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))', cursor: 'pointer' }}
                    >
                        <div className="feature-icon" style={{ background: 'var(--color-success-600)' }}>🤖</div>
                        <h3 className="feature-title">{locale === 'ar' ? 'سيرة ذاتية ATS' : 'ATS-Lebenslauf'}</h3>
                        <p className="feature-desc">{locale === 'ar' ? 'سيرة ذاتية احترافية محسنة لأنظمة التوظيف.' : 'Optimiert für ATS-Systeme.'}</p>
                        <span className="text-xs text-primary-300 mt-2 block">{locale === 'ar' ? `تكلفة الخدمة: ${CV_COST} رصيد` : `Kosten: ${CV_COST} Credits`}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'form') {
        return (
            <div className="glass-card animate-scale-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setStep('type-selection')}
                        className="btn btn-ghost"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: locale === 'ar' ? '0' : '1rem',
                            marginLeft: locale === 'ar' ? '1rem' : '0',
                            padding: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--color-neutral-100)'
                        }}
                    >
                        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                            {locale === 'ar' ? '→' : '←'}
                        </span>
                    </button>
                    <h2 className="text-xl font-bold text-white">{locale === 'ar' ? 'أدخل معلوماتك' : 'Geben Sie Ihre Daten ein'}</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Personal Info */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4 text-primary-400">{locale === 'ar' ? 'المعلومات الشخصية' : 'Persönliche Daten'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder={locale === 'ar' ? 'الاسم الأول' : 'Vorname'} className="input-field" value={personalInfo.firstName} onChange={e => setPersonalInfo({ ...personalInfo, firstName: e.target.value })} />
                            <input type="text" placeholder={locale === 'ar' ? 'الاسم الأخير' : 'Nachname'} className="input-field" value={personalInfo.lastName} onChange={e => setPersonalInfo({ ...personalInfo, lastName: e.target.value })} />
                            <input type="text" placeholder={locale === 'ar' ? 'المسمى الوظيفي المستهدف' : 'Angestrebte Position'} className="input-field col-span-2" value={personalInfo.jobTitle} onChange={e => setPersonalInfo({ ...personalInfo, jobTitle: e.target.value })} />
                            <input type="email" placeholder="Email" className="input-field" value={personalInfo.email} onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
                            <input type="tel" placeholder={locale === 'ar' ? 'رقم الهاتف' : 'Telefonnummer'} className="input-field" value={personalInfo.phone} onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })} />
                            <input type="text" placeholder={locale === 'ar' ? 'العنوان' : 'Adresse'} className="input-field col-span-2" value={personalInfo.address} onChange={e => setPersonalInfo({ ...personalInfo, address: e.target.value })} />
                            <input type="text" placeholder="LinkedIn URL" className="input-field col-span-2" value={personalInfo.linkedIn} onChange={e => setPersonalInfo({ ...personalInfo, linkedIn: e.target.value })} />
                        </div>
                    </section>

                    {/* Professional Summary */}
                    <section>
                        <h3 className="text-lg font-semibold mb-4 text-primary-400">{locale === 'ar' ? 'الملف المهني' : 'Profil'}</h3>
                        <textarea
                            placeholder={locale === 'ar' ? 'اكتب نبذة مهنية عنك (بالعربية)... وسيقوم الذكاء الاصطناعي بصياغتها بالألمانية.' : 'Beschreiben Sie Ihr Profil...'}
                            className="input-field w-full h-32"
                            value={summary}
                            onChange={e => setSummary(e.target.value)}
                        />
                    </section>

                    {/* Experience */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary-400">{locale === 'ar' ? 'الخبرة العملية' : 'Berufserfahrung'}</h3>
                            <button onClick={addExperience} className="btn btn-sm btn-outline">+ {locale === 'ar' ? 'إضافة' : 'Hinzufügen'}</button>
                        </div>
                        {experience.map((exp, index) => (
                            <div key={index} className="p-4 border border-neutral-700 rounded-lg mb-4 bg-white/5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <input type="text" placeholder={locale === 'ar' ? 'المسمى الوظيفي' : 'Position'} className="input-field" value={exp.title} onChange={e => { const newExp = [...experience]; newExp[index].title = e.target.value; setExperience(newExp); }} />
                                    <input type="text" placeholder={locale === 'ar' ? 'اسم الشركة' : 'Firma'} className="input-field" value={exp.company} onChange={e => { const newExp = [...experience]; newExp[index].company = e.target.value; setExperience(newExp); }} />
                                    <input type="text" placeholder={locale === 'ar' ? 'تاريخ البدء (MM/YYYY)' : 'Von (MM/JJJJ)'} className="input-field" value={exp.startDate} onChange={e => { const newExp = [...experience]; newExp[index].startDate = e.target.value; setExperience(newExp); }} />
                                    <input type="text" placeholder={locale === 'ar' ? 'تاريخ الانتهاء (أو "حاضر")' : 'Bis (oder "Aktuell")'} className="input-field" value={exp.endDate} onChange={e => { const newExp = [...experience]; newExp[index].endDate = e.target.value; setExperience(newExp); }} />
                                </div>
                                <textarea placeholder={locale === 'ar' ? 'وصف المهام والإنجازات...' : 'Beschreibung...'} className="input-field w-full h-24 mb-2" value={exp.description} onChange={e => { const newExp = [...experience]; newExp[index].description = e.target.value; setExperience(newExp); }} />
                                <button onClick={() => removeExperience(index)} className="text-red-400 text-sm hover:text-red-300">{locale === 'ar' ? 'حذف' : 'Löschen'}</button>
                            </div>
                        ))}
                    </section>

                    {/* Education */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary-400">{locale === 'ar' ? 'التعليم' : 'Ausbildung'}</h3>
                            <button onClick={addEducation} className="btn btn-sm btn-outline">+ {locale === 'ar' ? 'إضافة' : 'Hinzufügen'}</button>
                        </div>
                        {education.map((edu, index) => (
                            <div key={index} className="p-4 border border-neutral-700 rounded-lg mb-4 bg-white/5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                                    <input type="text" placeholder={locale === 'ar' ? 'الدرجة العلمية' : 'Abschluss'} className="input-field" value={edu.degree} onChange={e => { const newEdu = [...education]; newEdu[index].degree = e.target.value; setEducation(newEdu); }} />
                                    <input type="text" placeholder={locale === 'ar' ? 'المؤسسة التعليمية' : 'Institution'} className="input-field" value={edu.institution} onChange={e => { const newEdu = [...education]; newEdu[index].institution = e.target.value; setEducation(newEdu); }} />
                                    <input type="text" placeholder={locale === 'ar' ? 'تاريخ البدء' : 'Von'} className="input-field" value={edu.startDate} onChange={e => { const newEdu = [...education]; newEdu[index].startDate = e.target.value; setEducation(newEdu); }} />
                                    <input type="text" placeholder={locale === 'ar' ? 'تاريخ الانتهاء' : 'Bis'} className="input-field" value={edu.endDate} onChange={e => { const newEdu = [...education]; newEdu[index].endDate = e.target.value; setEducation(newEdu); }} />
                                </div>
                                <button onClick={() => removeEducation(index)} className="text-red-400 text-sm hover:text-red-300">{locale === 'ar' ? 'حذف' : 'Löschen'}</button>
                            </div>
                        ))}
                    </section>

                    {/* Skills */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary-400">{locale === 'ar' ? 'المهارات' : 'Kenntnisse'}</h3>
                            <button onClick={addSkill} className="btn btn-sm btn-outline">+ {locale === 'ar' ? 'إضافة' : 'Hinzufügen'}</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {skills.map((skill, index) => (
                                <div key={index} className="flex gap-2">
                                    <input type="text" placeholder={locale === 'ar' ? 'مهارة (مثال: Javascript, القيادة...)' : 'Fähigkeit'} className="input-field flex-1" value={skill} onChange={e => { const newSkills = [...skills]; newSkills[index] = e.target.value; setSkills(newSkills); }} />
                                    <button onClick={() => removeSkill(index)} className="text-red-400 hover:text-red-300">×</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Languages */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary-400">{locale === 'ar' ? 'اللغات' : 'Sprachen'}</h3>
                            <button onClick={addLanguage} className="btn btn-sm btn-outline">+ {locale === 'ar' ? 'إضافة' : 'Hinzufügen'}</button>
                        </div>
                        {languages.map((lang, index) => (
                            <div key={index} className="flex gap-4 mb-2">
                                <input type="text" placeholder={locale === 'ar' ? 'اللغة' : 'Sprache'} className="input-field flex-1" value={lang.language} onChange={e => { const newLangs = [...languages]; newLangs[index].language = e.target.value; setLanguages(newLangs); }} />
                                <input type="text" placeholder={locale === 'ar' ? 'المستوى' : 'Niveau'} className="input-field flex-1" value={lang.level} onChange={e => { const newLangs = [...languages]; newLangs[index].level = e.target.value; setLanguages(newLangs); }} />
                                <button onClick={() => removeLanguage(index)} className="text-red-400 hover:text-red-300">×</button>
                            </div>
                        ))}
                    </section>

                    <button onClick={handleGenerate} className="btn btn-primary btn-lg mt-8 w-full">
                        {locale === 'ar' ? `إنشاء السيرة الذاتية (${CV_COST} رصيد)` : `Lebenslauf erstellen (${CV_COST} Credits)`}
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'generating') {
        return (
            <div className="glass-card flex-center" style={{ minHeight: '400px', flexDirection: 'column' }}>
                <div className="loading-spinner mb-4"></div>
                <h3 className="text-xl font-bold">{locale === 'ar' ? 'جاري إنشاء السيرة الذاتية...' : 'Lebenslauf wird erstellt...'}</h3>
                <p className="text-neutral-400 mt-2 text-center max-w-md">
                    {locale === 'ar'
                        ? 'يقوم الذكاء الاصطناعي الآن بترجمة بياناتك وصياغتها وتنسيقها لتناسب سوق العمل الألماني.'
                        : 'Die KI übersetzt, formuliert und formatiert Ihre Daten für den deutschen Arbeitsmarkt.'}
                </p>
            </div>
        );
    }

    if (step === 'result' && generatedCV) {
        return (
            <div className="glass-card animate-scale-in">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
                    <div className="flex items-center">
                        <button
                            onClick={() => setStep('form')}
                            className="btn btn-ghost"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: locale === 'ar' ? '0' : '1rem',
                                marginLeft: locale === 'ar' ? '1rem' : '0',
                                padding: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--color-neutral-100)'
                            }}
                        >
                            <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                                {locale === 'ar' ? '→' : '←'}
                            </span>
                        </button>
                        <h2 className="text-xl font-bold text-white">{locale === 'ar' ? 'سيرتك الذاتية جاهزة!' : 'Ihr Lebenslauf ist fertig!'}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="preview-container bg-white text-black p-8 rounded shadow-lg overflow-y-auto max-h-[600px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {/* Simple HTML Preview */}
                        <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4">{generatedCV.personalInfo.firstName} {generatedCV.personalInfo.lastName}</h1>
                        <p className="text-xl text-gray-600 mb-4">{generatedCV.personalInfo.jobTitle}</p>
                        <p className="text-sm text-gray-500 mb-6">{generatedCV.personalInfo.email} | {generatedCV.personalInfo.phone} | {generatedCV.personalInfo.address}</p>

                        {generatedCV.summary && (
                            <div className="mb-6">
                                <h3 className="text-lg font-bold border-b border-gray-300 mb-2 uppercase text-gray-800">Profil</h3>
                                <p className="text-gray-700 leading-relaxed">{generatedCV.summary}</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-lg font-bold border-b border-gray-300 mb-2 uppercase text-gray-800">Berufserfahrung</h3>
                            {generatedCV.experience.map((exp: any, i: number) => (
                                <div key={i} className="mb-4">
                                    <h4 className="font-bold text-gray-800">{exp.title}</h4>
                                    <p className="text-gray-600 italic text-sm">{exp.company}, {exp.location} | {exp.startDate} - {exp.endDate}</p>
                                    <p className="text-gray-700 mt-1 text-sm">{exp.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold border-b border-gray-300 mb-2 uppercase text-gray-800">Ausbildung</h3>
                            {generatedCV.education.map((edu: any, i: number) => (
                                <div key={i} className="mb-4">
                                    <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                                    <p className="text-gray-600 italic text-sm">{edu.institution}, {edu.location} | {edu.startDate} - {edu.endDate}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-bold border-b border-gray-300 mb-2 uppercase text-gray-800">Kenntnisse</h3>
                            <div className="flex flex-wrap gap-2">
                                {generatedCV.skills.map((skill: string, i: number) => (
                                    <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm text-gray-700">{skill}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="actions-container flex flex-col gap-4">
                        <h3 className="text-lg font-semibold text-white mb-2">{locale === 'ar' ? 'خيارات التنزيل' : 'Download-Optionen'}</h3>

                        <PDFDownloadLink document={<CvDocument data={generatedCV} />} fileName={`${generatedCV.personalInfo.lastName}_Lebenslauf.pdf`}>
                            {({ loading }) => (
                                <button className="btn btn-primary w-full py-4 flex items-center justify-center gap-2" disabled={loading}>
                                    {loading ? 'Generating PDF...' : (
                                        <>
                                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            {locale === 'ar' ? 'تحميل PDF (نسخة ATS)' : 'PDF herunterladen (ATS)'}
                                        </>
                                    )}
                                </button>
                            )}
                        </PDFDownloadLink>

                        <button
                            className="btn btn-secondary w-full py-4 flex items-center justify-center gap-2"
                            onClick={() => {
                                const text = JSON.stringify(generatedCV, null, 2);
                                const blob = new Blob([text], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'cv_data.json';
                                a.click();
                            }}
                        >
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            {locale === 'ar' ? 'تحميل بيانات JSON' : 'JSON Daten herunterladen'}
                        </button>

                        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-sm text-blue-200">
                                {locale === 'ar'
                                    ? 'ملاحظة: هذا التصميم بسيط خصيصاً ليتم قراءته بسهولة بواسطة أنظمة التوظيف الآلية (ATS). المحتوى هو الأهم!'
                                    : 'Hinweis: Dieses einfache Design ist für ATS-Systeme optimiert. Der Inhalt zählt!'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
